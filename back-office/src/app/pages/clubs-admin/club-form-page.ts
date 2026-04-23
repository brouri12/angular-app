import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import * as L from 'leaflet';
import { Club, ClubType } from '../../models/club.model';
import { ClubService } from '../../services/club.service';
import { ClubsRefreshService } from '../../services/clubs-refresh.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

const MAP_DEFAULT_CENTER: L.LatLngTuple = [36.8065, 10.1815];

@Component({
  selector: 'app-club-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, JoinConfirmModalComponent],
  templateUrl: './club-form-page.html',
  styleUrls: ['./club-form-page.css'],
})
export class ClubFormPage implements OnInit, AfterViewInit, OnDestroy {
  loadingAction = false;
  errorMsg = '';
  isEdit = false;
  idClub?: number;
  form: Club = { nomClub: '', description: '', type: 'ONLINE', ville: '' };
  selectedFile: File | null = null;
  types: ClubType[] = ['ONLINE', 'PRESENTIEL'];
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: 'CREATE' | 'UPDATE' | null = null;
  geocodingAddress = '';
  private map?: L.Map;
  private marker?: L.Marker;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clubService: ClubService,
    private refreshService: ClubsRefreshService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    if (this.isEdit) {
      this.idClub = Number(id);
      this.clubService.getById(this.idClub).subscribe({
        next: (c) => {
          this.form = { idClub: c.idClub, nomClub: c.nomClub || '', description: c.description || '', type: (c.type as ClubType) || 'ONLINE', ville: c.ville || '', dateCreation: c.dateCreation, logo: c.logo };
          if (this.form.type === 'PRESENTIEL') this.scheduleMapInit();
        },
        error: () => (this.errorMsg = 'Unable to load club.')
      });
    }
  }

  ngAfterViewInit(): void { if (this.form.type === 'PRESENTIEL') this.scheduleMapInit(); }
  ngOnDestroy(): void { this.teardownMap(); }

  onTypeChange(): void {
    if (this.form.type !== 'PRESENTIEL') { this.teardownMap(); this.geocodingAddress = ''; return; }
    this.scheduleMapInit();
  }

  private scheduleMapInit(): void { setTimeout(() => this.ensureMap(), 0); }
  private teardownMap(): void { this.map?.remove(); this.map = undefined; this.marker = undefined; }

  private fixLeafletDefaultIcons(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl: '/leaflet/marker-icon-2x.png', iconUrl: '/leaflet/marker-icon.png', shadowUrl: '/leaflet/marker-shadow.png' });
  }

  private ensureMap(): void {
    if (this.form.type !== 'PRESENTIEL') return;
    const el = document.getElementById('club-map');
    if (!el) return;
    if (this.map) { this.map.invalidateSize(); return; }
    this.fixLeafletDefaultIcons();
    this.map = L.map(el).setView(MAP_DEFAULT_CENTER, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(this.map);
    this.map.whenReady(() => this.map?.invalidateSize());
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        const lat = Math.round(e.latlng.lat * 1e6) / 1e6;
        const lng = Math.round(e.latlng.lng * 1e6) / 1e6;
        this.setMarker(lat, lng);
        this.reverseGeocode(lat, lng);
      });
    });
  }

  private setMarker(lat: number, lng: number): void {
    if (!this.map) return;
    const ll: L.LatLngTuple = [lat, lng];
    if (this.marker) this.marker.setLatLng(ll); else this.marker = L.marker(ll).addTo(this.map);
    this.map.panTo(ll);
  }

  searchOnMap(): void {
    const q = (this.form.ville || '').trim();
    if (!q) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, { headers: { Accept: 'application/json' } })
      .then(r => r.json())
      .then((results: { lat: string; lon: string; display_name?: string }[]) => {
        this.ngZone.run(() => {
          if (!results?.length) { this.geocodingAddress = 'No results.'; return; }
          const lat = parseFloat(results[0].lat), lon = parseFloat(results[0].lon);
          this.geocodingAddress = results[0].display_name || '';
          if (this.geocodingAddress) this.form.ville = this.geocodingAddress;
          if (this.map) { this.map.setView([lat, lon], 15); this.setMarker(lat, lon); }
          else { this.scheduleMapInit(); setTimeout(() => { this.map?.setView([lat, lon], 15); this.setMarker(lat, lon); }, 100); }
        });
      }).catch(() => this.ngZone.run(() => this.geocodingAddress = 'Search failed.'));
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, { headers: { Accept: 'application/json' } })
      .then(r => r.json())
      .then((data: { display_name?: string }) => {
        this.ngZone.run(() => {
          const full = (data.display_name || '').trim();
          this.geocodingAddress = full || `${lat}, ${lng}`;
          if (full) this.form.ville = full;
        });
      }).catch(() => this.ngZone.run(() => { const fb = `${lat}, ${lng}`; this.geocodingAddress = fb; if (!(this.form.ville || '').trim()) this.form.ville = fb; }));
  }

  onFileChange(e: Event) { const input = e.target as HTMLInputElement; this.selectedFile = input.files && input.files.length ? input.files[0] : null; }

  close(withRefresh: boolean = false) {
    this.router.navigate(['../'], { relativeTo: this.route }).then(() => { if (withRefresh) this.refreshService.trigger(); });
  }

  openConfirmCreate() { this.errorMsg = ''; this.pendingAction = 'CREATE'; this.confirmTitle = 'Create club'; this.confirmMessage = `Confirm creation of "${this.form.nomClub || ''}"?`; this.confirmOpen = true; }
  openConfirmUpdate() { this.errorMsg = ''; this.pendingAction = 'UPDATE'; this.confirmTitle = 'Save changes'; this.confirmMessage = `Confirm update for club #${this.idClub}?`; this.confirmOpen = true; }
  cancelAction() { this.confirmOpen = false; this.pendingAction = null; }

  confirmAction() {
    this.confirmOpen = false;
    if (this.pendingAction === 'CREATE') { this.pendingAction = null; this.create(); return; }
    if (this.pendingAction === 'UPDATE') { this.pendingAction = null; this.update(); return; }
    this.pendingAction = null;
  }

  create() {
    this.loadingAction = true; this.errorMsg = '';
    this.clubService.create(this.form).pipe(finalize(() => (this.loadingAction = false))).subscribe({
      next: (created) => {
        if (this.selectedFile && created?.idClub) {
          this.loadingAction = true;
          this.clubService.uploadLogo(created.idClub, this.selectedFile).pipe(finalize(() => (this.loadingAction = false))).subscribe({ next: () => this.close(true), error: (err: any) => (this.errorMsg = err?.error || 'Logo upload error') });
        } else this.close(true);
      },
      error: (err: any) => (this.errorMsg = err?.error || 'Create error')
    });
  }

  update() {
    if (!this.idClub) return;
    this.loadingAction = true; this.errorMsg = '';
    this.clubService.update(this.idClub, this.form).pipe(finalize(() => (this.loadingAction = false))).subscribe({
      next: () => {
        if (this.selectedFile) {
          this.loadingAction = true;
          this.clubService.uploadLogo(this.idClub!, this.selectedFile).pipe(finalize(() => (this.loadingAction = false))).subscribe({ next: () => this.close(true), error: (err: any) => (this.errorMsg = err?.error || 'Logo upload error') });
        } else this.close(true);
      },
      error: (err: any) => (this.errorMsg = err?.error || 'Update error')
    });
  }
}
