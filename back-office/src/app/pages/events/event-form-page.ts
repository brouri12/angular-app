import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { EventsService } from '../../services/events.service';
import { EventsRefreshService } from '../../services/events-refresh.service';
import { EventModel, EventLevel, EventMode, EventType } from '../../models/event.model';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

declare const google: any;

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, JoinConfirmModalComponent],
  templateUrl: './event-form-page.html',
  styleUrls: ['./event-form-page.css'],
})
export class EventFormPage implements OnInit, AfterViewInit {

  loadingAction = false;
  errorMsg = '';

  isEdit = false;
  idEvent?: number;

  form: EventModel = this.emptyForm();

  types: EventType[] = ['WORKSHOP', 'SPEAKING', 'EXAM'];
  modes: EventMode[] = ['ONLINE', 'PRESENTIEL'];
  levels: EventLevel[] = ['A1','A2','B1','B2','C1','C2'];

  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: 'CREATE' | 'UPDATE' | null = null;

  // ✅ MAP
  private map: any;
  private marker: any;
  private geocoder: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private refreshService: EventsRefreshService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit) {
      this.idEvent = Number(id);

      this.eventsService.getById(this.idEvent).subscribe({
        next: (ev) => {
          this.form = { ...ev };
          // si tu veux centrer la map après load, tu peux le faire dans ngAfterViewInit via setTimeout
        },
        error: () => (this.errorMsg = "Unable to load the event."),
      });
    }
  }

  ngAfterViewInit(): void {
  // ✅ attendre que le modal soit vraiment rendu (important)
  setTimeout(() => {
    this.initPlacesAutocomplete();
    this.initMap();

    // ✅ resize: important dans les modals
    setTimeout(() => {
      if (this.map && google?.maps?.event) {
        google.maps.event.trigger(this.map, 'resize');
      }
    }, 200);

  }, 50);
}

  // ✅ Autocomplete (tape dans l'input)
  private initPlacesAutocomplete() {
    const input = document.getElementById('locationInput') as HTMLInputElement;
    if (!input) return;

    if (typeof google === 'undefined' || !google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const value = place?.formatted_address || place?.name || input.value;

      this.form.location = value;

      // center map if geometry exists
      if (place?.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        this.setMarkerAndCenter(lat, lng);
      }
    });
  }

  // ✅ Map click -> get address
  private initMap() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  // Google script not loaded
  if (typeof google === 'undefined' || !google?.maps) return;

  const defaultCenter = { lat: 36.8065, lng: 10.1815 }; // Tunis

  this.map = new google.maps.Map(mapDiv, {
    center: defaultCenter,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  this.marker = new google.maps.Marker({
    position: defaultCenter,
    map: this.map,
  });

  // ✅ click on map
  this.map.addListener('click', (e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    this.marker.setPosition({ lat, lng });

    // ✅ sauvegarder dans ton form
    (this.form as any).lat = lat;
    (this.form as any).lon = lng;

    // option: remplir location par coordonnées
    this.form.location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  });

  // ✅ important si modal
  google.maps.event.addListenerOnce(this.map, 'idle', () => {
    google.maps.event.trigger(this.map, 'resize');
  });
}

  private setMarkerAndCenter(lat: number, lng: number) {
    const pos = { lat, lng };
    this.marker.setPosition(pos);
    this.map.panTo(pos);
    this.map.setZoom(14);
  }

  private reverseGeocode(lat: number, lng: number) {
    if (!this.geocoder) return;

    this.geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        this.form.location = results[0].formatted_address;
      }
    });
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
    this.confirmMessage = `Confirm creation of "${this.form.title || ''}"?`;
    this.confirmOpen = true;
  }

  openConfirmUpdate() {
    this.errorMsg = '';
    this.pendingAction = 'UPDATE';
    this.confirmTitle = 'Save changes';
    this.confirmMessage = `Confirm update for event #${this.idEvent} "${this.form.title || ''}"?`;
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
  // CREATE / UPDATE
  // =========================
  create() {
    this.loadingAction = true;
    this.errorMsg = '';

    const payload = this.normalizePayload({ ...this.form });
    delete (payload as any).idEvent;

    this.eventsService.create(payload)
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: () => this.close(true),
        error: () => (this.errorMsg = "Error while creating the event."),
      });
  }

  update() {
    if (!this.idEvent) return;

    this.loadingAction = true;
    this.errorMsg = '';

    const payload = this.normalizePayload({ ...this.form });

    this.eventsService.update(this.idEvent, payload)
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: () => this.close(true),
        error: () => (this.errorMsg = "Error while updating the event."),
      });
  }

  private normalizePayload(p: EventModel): EventModel {
    return {
      ...p,
      eventDate: (p.eventDate || '').slice(0, 10),
      startTime: (p.startTime || '00:00:00').length === 5 ? p.startTime + ':00' : p.startTime,
      endTime: (p.endTime || '00:00:00').length === 5 ? p.endTime + ':00' : p.endTime,
      capacity: Number(p.capacity || 0),
      clubId: p.clubId ? Number(p.clubId) : undefined,
    };
  }

  private emptyForm(): EventModel {
    return {
      title: '',
      description: '',
      type: 'WORKSHOP',
      mode: 'ONLINE',
      eventDate: '',
      startTime: '09:00:00',
      endTime: '10:00:00',
      location: '',
      capacity: 0,
      requiredLevel: 'A1',
      clubId: undefined,
    };
  }
}