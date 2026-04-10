import { AfterViewInit, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, TimeoutError, throwError } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import * as L from 'leaflet';

import { EventsService } from '../../services/events.service';
import { EventsRefreshService } from '../../services/events-refresh.service';
import { Event, EventLevel, EventMode, EventType } from '../../models/event.model';

import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

/** Default map view (Tunis) when no coordinates yet */
const MAP_DEFAULT_CENTER: L.LatLngTuple = [36.8065, 10.1815];

/** Coordinates are appended to `location` as …|@lat,lng (no new DB columns). */
const LOC_COORD_SUFFIX = /\|@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\s*$/;

/** If the API does not answer, the HTTP call can hang for a long time — without this, the UI stays on "Creating…" forever. */
const HTTP_TIMEOUT_MS = 20_000;

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, JoinConfirmModalComponent],
  templateUrl: './event-form-page.html',
  styleUrls: ['./event-form-page.css'],
})
export class EventFormPage implements OnInit, AfterViewInit, OnDestroy {
  loadingAction = false;
  errorMsg = '';

  isEdit = false;
  idEvent?: number;

  /** Texte du champ lieu (sans le suffixe coordonnées encodé dans `location`). */
  locationAddress = '';
  /** Position carte (local) — fusionnée dans `location` à l’enregistrement. */
  pickedLat?: number;
  pickedLng?: number;

  /** Adresse affichée sous la carte (géocodage — même principe que le formulaire club). */
  geocodingAddress = '';

  form: Event = this.emptyForm();

  types: EventType[] = ['WORKSHOP', 'SPEAKING', 'EXAM'];
  modes: EventMode[] = ['ONLINE', 'PRESENTIEL'];
  levels: EventLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: 'CREATE' | 'UPDATE' | null = null;

  private map?: L.Map;
  private locationMarker?: L.Marker;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private refreshService: EventsRefreshService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit) {
      this.idEvent = Number(id);

      this.eventsService.getById(this.idEvent).subscribe({
        next: (ev) => {
          this.form = { ...ev };
          this.parseLocationFromStored(this.form.location || '');

          if (ev.latitude != null && ev.longitude != null) {
            this.pickedLat = ev.latitude;
            this.pickedLng = ev.longitude;
          }

          this.syncFormLocation();
          if (this.form.mode === 'PRESENTIEL') {
            this.scheduleMapInit();
          }
        },
        error: () => {
          this.errorMsg = 'Unable to load the event.';
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.form.mode === 'PRESENTIEL') {
      this.scheduleMapInit();
    }
  }

  ngOnDestroy(): void {
    this.teardownMap();
  }

  /** Comme `onTypeChange()` du club : carte seulement en présentiel. */
  onModeChange(): void {
    if (this.form.mode !== 'PRESENTIEL') {
      this.teardownMap();
      this.geocodingAddress = '';
      this.pickedLat = undefined;
      this.pickedLng = undefined;
      this.locationAddress = '';
      this.syncFormLocation();
      return;
    }
    this.scheduleMapInit();
  }

  private scheduleMapInit(): void {
    setTimeout(() => this.ensureMap(), 0);
  }

  private teardownMap(): void {
    this.map?.remove();
    this.map = undefined;
    this.locationMarker = undefined;
  }

  close(withRefresh: boolean = false) {
    this.router.navigate(['../'], { relativeTo: this.route }).then(() => {
      if (withRefresh) this.refreshService.trigger();
    });
  }

  // =========================
  // CONFIRM FLOW
  // =========================

  openConfirmCreate() {
    this.errorMsg = '';
    this.pendingAction = 'CREATE';
    this.confirmTitle = 'Create event';
    this.confirmMessage = `Confirm creation of "${this.form.title}"?`;
    this.confirmOpen = true;
  }

  openConfirmUpdate() {
    this.errorMsg = '';
    this.pendingAction = 'UPDATE';
    this.confirmTitle = 'Save changes';
    this.confirmMessage = `Confirm update for event "${this.form.title}"?`;
    this.confirmOpen = true;
  }

  cancelAction() {
    this.confirmOpen = false;
    this.pendingAction = null;
  }

  confirmAction() {
    this.confirmOpen = false;

    if (this.pendingAction === 'CREATE') {
      this.pendingAction = null;
      this.create();
      return;
    }

    if (this.pendingAction === 'UPDATE') {
      this.pendingAction = null;
      this.update();
      return;
    }

    this.pendingAction = null;
  }

  // =========================
  // CREATE
  // =========================

  create() {
    this.loadingAction = true;
    this.errorMsg = '';
    this.syncFormLocation();

    const payload = this.normalizePayload({ ...this.form });
    delete payload.idEvent;

    this.withRequestTimeout(this.eventsService.create(payload as Event))
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: () => this.close(true),
        error: (err) => {
          this.errorMsg = this.httpErrorMessage(err, 'Error while creating the event.');
        },
      });
  }

  // =========================
  // UPDATE
  // =========================

  update() {
    if (!this.idEvent) return;

    this.loadingAction = true;
    this.errorMsg = '';
    this.syncFormLocation();

    const payload = this.normalizePayload({ ...this.form });

    this.withRequestTimeout(this.eventsService.update(this.idEvent, payload as Event))
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: () => this.close(true),
        error: (err) => {
          this.errorMsg = this.httpErrorMessage(err, 'Error while updating the event.');
        },
      });
  }

  // =========================
  // NORMALIZE
  // =========================

  /**
   * Corps JSON strictement compatible Spring/Jackson :
   * - pas de chaînes vides pour les dates
   * - heures au format HH:mm:ss
   * - coordonnées explicites si présentes
   */
  private normalizePayload(p: Event): Partial<Event> {
    const eventDateStr = (p.eventDate || '').trim().slice(0, 10);
    const startRaw = p.startTime || '09:00:00';
    const endRaw = p.endTime || '10:00:00';

    const startTime = startRaw.length === 5 ? `${startRaw}:00` : startRaw;
    const endTime = endRaw.length === 5 ? `${endRaw}:00` : endRaw;

    const body: Partial<Event> = {
      title: p.title,
      description: p.description,
      type: p.type,
      mode: p.mode,
      startTime,
      endTime,
      location: this.buildLocationForPayload(),
      capacity: Number(p.capacity ?? 0),
      requiredLevel: p.requiredLevel,
    };

    if (eventDateStr.length === 10) {
      body.eventDate = eventDateStr;
    }

    if (p.clubId != null) {
      body.clubId = Number(p.clubId);
    }

    if (p.status != null) {
      body.status = p.status;
    }

    if (this.pickedLat != null && !Number.isNaN(this.pickedLat)) {
      body.latitude = this.pickedLat;
    }

    if (this.pickedLng != null && !Number.isNaN(this.pickedLng)) {
      body.longitude = this.pickedLng;
    }

    return body;
  }

  /** Cuts hanging requests so the button does not stay on "Creating…" indefinitely. */
  private withRequestTimeout<T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      timeout(HTTP_TIMEOUT_MS),
      catchError((err: unknown) => {
        const isTimeout =
          err instanceof TimeoutError ||
          (typeof err === 'object' &&
            err !== null &&
            (err as { name?: string }).name === 'TimeoutError');

        if (isTimeout) {
          return throwError(
            () =>
              new HttpErrorResponse({
                error:
                  'No response from the server (timeout). Start event-service on port 8082 and check that MySQL is running.',
                status: 0,
                statusText: 'Timeout',
              }),
          );
        }

        return throwError(() => err);
      }),
    );
  }

  private httpErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const b = err.error;

      if (typeof b === 'string' && b.trim()) {
        return b.trim();
      }

      if (b && typeof b === 'object') {
        const o = b as Record<string, unknown>;

        if (typeof o['message'] === 'string' && String(o['message']).trim()) {
          return String(o['message']).trim();
        }

        const errs = o['errors'];
        if (Array.isArray(errs)) {
          const parts = errs
            .map((e: unknown) => {
              if (e && typeof e === 'object' && 'defaultMessage' in e) {
                return String((e as { defaultMessage?: string }).defaultMessage || '').trim();
              }
              return '';
            })
            .filter(Boolean);

          if (parts.length) {
            return parts.join(' ');
          }
        }
      }

      if (err.status === 0) {
        return 'Network error — is the event service running (port 8082)?';
      }

      return err.message
        ? `${fallback} (${err.status}: ${err.message})`
        : `${fallback} (HTTP ${err.status})`;
    }

    return fallback;
  }

  /** Met à jour `form.location` pour la validation du formulaire (texte + optionnellement |@lat,lng). */
  syncFormLocation(): void {
    this.form.location = this.buildLocationForPayload();
  }

  /** Recompose le champ `location` unique avec coordonnées optionnelles. */
  private buildLocationForPayload(): string {
    const addr = (this.locationAddress || '').trim();

    if (
      this.pickedLat != null &&
      this.pickedLng != null &&
      !Number.isNaN(this.pickedLat) &&
      !Number.isNaN(this.pickedLng)
    ) {
      return `${addr}|@${this.pickedLat},${this.pickedLng}`;
    }

    return addr;
  }

  /** Sépare le texte et les coordonnées stockées dans `location`. */
  private parseLocationFromStored(stored: string): void {
    const m = stored.match(LOC_COORD_SUFFIX);

    if (m && m.index !== undefined) {
      this.locationAddress = stored.slice(0, m.index).trimEnd();
      this.pickedLat = Number(m[1]);
      this.pickedLng = Number(m[2]);
    } else {
      this.locationAddress = stored;
      this.pickedLat = undefined;
      this.pickedLng = undefined;
    }
  }

  /** Icônes Leaflet — mêmes chemins publics que le formulaire club (`/leaflet/…`). */
  private fixLeafletDefaultIcons(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
  }

  private ensureMap(): void {
    if (this.form.mode !== 'PRESENTIEL') return;

    const el = document.getElementById('event-map');
    if (!el) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.fixLeafletDefaultIcons();

    const center = this.formCenterOrDefault();
    this.map = L.map(el).setView(center, this.hasPickedCoordinates() ? 15 : 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    this.map.whenReady(() => {
      this.map?.invalidateSize();
      if (this.hasPickedCoordinates()) {
        this.map?.setView([this.pickedLat!, this.pickedLng!], 15);
        this.setOrMoveMarker(this.pickedLat!, this.pickedLng!);
      }
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        const lat = Math.round(e.latlng.lat * 1e6) / 1e6;
        const lng = Math.round(e.latlng.lng * 1e6) / 1e6;

        this.pickedLat = lat;
        this.pickedLng = lng;
        this.setOrMoveMarker(lat, lng);
        this.syncFormLocation();
        this.reverseGeocode(lat, lng);
      });
    });
  }

  searchOnMap(): void {
    const q = (this.locationAddress || '').trim();
    if (!q) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q,
    )}&limit=1`;

    fetch(url, { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((results: { lat: string; lon: string; display_name?: string }[]) => {
        this.ngZone.run(() => {
          if (!results?.length) {
            this.geocodingAddress = 'No results for this search.';
            return;
          }
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          this.pickedLat = lat;
          this.pickedLng = lon;
          this.geocodingAddress = results[0].display_name || '';
          if (this.geocodingAddress) {
            this.locationAddress = this.geocodingAddress;
          }
          if (this.map) {
            this.map.setView([lat, lon], 15);
            this.setOrMoveMarker(lat, lon);
            this.syncFormLocation();
          } else {
            this.scheduleMapInit();
            setTimeout(() => {
              this.map?.setView([lat, lon], 15);
              this.setOrMoveMarker(lat, lon);
              this.syncFormLocation();
            }, 100);
          }
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.geocodingAddress = 'Search failed.';
        });
      });
  }

  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    fetch(url, { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((data: { display_name?: string }) => {
        this.ngZone.run(() => {
          // Toujours utiliser l’adresse complète Nominatim (ne pas la remplacer par la seule ville).
          const full = (data.display_name || '').trim();
          this.geocodingAddress = full || `${lat}, ${lng}`;
          if (full) {
            this.locationAddress = full;
          }
          this.syncFormLocation();
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          const fallback = `${lat}, ${lng}`;
          this.geocodingAddress = fallback;
          if (!(this.locationAddress || '').trim()) {
            this.locationAddress = fallback;
          }
          this.syncFormLocation();
        });
      });
  }

  private formCenterOrDefault(): L.LatLngTuple {
    if (this.hasPickedCoordinates()) {
      return [this.pickedLat!, this.pickedLng!];
    }
    return MAP_DEFAULT_CENTER;
  }

  private hasPickedCoordinates(): boolean {
    return this.pickedLat != null && this.pickedLng != null;
  }

  /** Pour le template : lieu valide si texte assez long ou pin sur la carte. */
  hasCoordsForLocation(): boolean {
    return (
      this.pickedLat != null &&
      this.pickedLng != null &&
      !Number.isNaN(this.pickedLat) &&
      !Number.isNaN(this.pickedLng)
    );
  }

  private setOrMoveMarker(lat: number, lng: number): void {
    if (!this.map) return;

    const ll: L.LatLngTuple = [lat, lng];

    if (this.locationMarker) {
      this.locationMarker.setLatLng(ll);
    } else {
      this.locationMarker = L.marker(ll).addTo(this.map);
    }

    this.map.panTo(ll);
  }

  // =========================
  // EMPTY FORM
  // =========================

  private emptyForm(): Event {
    this.locationAddress = '';
    this.pickedLat = undefined;
    this.pickedLng = undefined;

    return {
      title: '',
      description: '',
      type: 'WORKSHOP',
      mode: 'ONLINE',
      eventDate: '',
      startTime: '09:00:00',
      endTime: '10:00:00',
      location: '',
    capacity: 10, // ✅ ICI
      requiredLevel: 'A1',
      clubId: undefined,
      status: 'OPEN',
    };
  }
}