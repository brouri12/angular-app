import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

type EventType = 'WORKSHOP' | 'SPEAKING' | 'EXAM';
type EventMode = 'ONLINE' | 'PRESENTIEL';
type EventLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface EventModel {
  idEvent: number;
  title: string;
  description: string;
  type: EventType;
  mode: EventMode;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  requiredLevel: EventLevel;
  clubId?: number;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, JoinConfirmModalComponent],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  // ✅ Filters
  activeLevel: 'All' | EventLevel = 'All';
  activeMode: 'All' | EventMode = 'All';

  levelOptions: Array<'All' | EventLevel> = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  modeOptions: Array<'All' | EventMode> = ['All', 'ONLINE', 'PRESENTIEL'];

  // ✅ data
  events: EventModel[] = [];
  filteredEvents: EventModel[] = [];

  // ✅ Backend URL
  private readonly API = 'http://localhost:8082/events';

  // ✅ Modal state
  isConfirmOpen = false;
  selectedEvent: EventModel | null = null;

  // ✅ messages
  errorMsg = '';
  successMsg = '';

  // ✅ Loading فقط للـ event اللي نعمله register
  loadingEventId: number | null = null;

  // ✅ events déjà inscrits
  joinedEventIds = new Set<number>();

  // ✅ auth
  currentUserId: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private registrationService: RegistrationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEvents();

    // ✅ مثل Clubs: كي user يجي من API يتعبّى currentUser$ → نحمل registrations
    this.authService.currentUser$.subscribe(user => {
      const idUser = Number((user as any)?.id_user);
      this.currentUserId = idUser || null;

      if (this.currentUserId) {
        this.loadMyRegistrations(this.currentUserId);
      } else {
        this.joinedEventIds = new Set<number>();
        this.cdr.detectChanges();
      }
    });

    // ✅ إذا عندك token والـ user مش متحمّل بعد
    if (!this.authService.getCurrentUserValue() && this.authService.isAuthenticated()) {
      this.authService.loadUser();
    }

    // ✅ إذا user موجود في cache مباشرة
    const cachedUser = this.authService.getCurrentUserValue();
    const cachedId = Number((cachedUser as any)?.id_user);
    if (cachedId) {
      this.currentUserId = cachedId;
      this.loadMyRegistrations(cachedId);
    }
  }

  // ==========================
  // EVENTS
  // ==========================
  loadEvents() {
    this.http.get<EventModel[]>(this.API).subscribe({
      next: (data) => {
        this.events = data || [];
        this.applyFilter();
      },
      error: (err) => console.error('GET /events error', err),
    });
  }

  applyFilter() {
    this.filteredEvents = this.events.filter(ev => {
      const okLevel = this.activeLevel === 'All' || ev.requiredLevel === this.activeLevel;
      const okMode  = this.activeMode === 'All' || ev.mode === this.activeMode;
      return okLevel && okMode;
    });
  }

  // ==========================
  // REGISTRATIONS (IMPORTANT)
  // ==========================
  loadMyRegistrations(userId: number) {
    this.registrationService.getRegistrationsByUserId(userId).subscribe({
      next: (rows: any[]) => {
        const ids = (rows || [])
          .map(r => Number(
            r?.eventId ??
            r?.idEvent ??
            r?.event?.idEvent ??
            r?.event?.id ??
            r?.event_id ??
            r?.id_event
          ))
          .filter(n => !Number.isNaN(n) && n > 0);

        this.joinedEventIds = new Set<number>(ids);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Events] getRegistrationsByUserId ERROR =', err);
        this.joinedEventIds = new Set<number>();
        this.cdr.detectChanges();
      }
    });
  }

  isRegistered(eventId?: number): boolean {
    if (!eventId) return false;
    return this.joinedEventIds.has(Number(eventId));
  }

  // ==========================
  // BADGES
  // ==========================
  badgeType(type?: string) {
    switch ((type || '').toUpperCase()) {
      case 'WORKSHOP': return 'badge-green';
      case 'SPEAKING': return 'badge-mint';
      case 'EXAM': return 'badge-orange';
      default: return 'badge-gray';
    }
  }

  badgeMode(mode?: string) {
    switch ((mode || '').toUpperCase()) {
      case 'ONLINE': return 'badge-orange';
      case 'PRESENTIEL': return 'badge-blue';
      default: return 'badge-gray';
    }
  }

  badgeLevel(level?: string) {
    switch ((level || '').toUpperCase()) {
      case 'A1':
      case 'A2': return 'badge-green';
      case 'B1':
      case 'B2': return 'badge-blue';
      case 'C1':
      case 'C2': return 'badge-purple';
      default: return 'badge-gray';
    }
  }

  // ==========================
  // HELPERS
  // ==========================
  formatDate(dateStr?: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  timeRange(ev: EventModel) {
    const start = (ev.startTime || '').slice(0, 5);
    const end = (ev.endTime || '').slice(0, 5);
    return `${start} - ${end}`;
  }

  // ==========================
  // CTA BUTTON
  // ==========================
  registerAndOpen(ev: EventModel) {
    if (!ev?.idEvent) return;

    this.errorMsg = '';
    this.successMsg = '';

    // ✅ si pas connecté -> login
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    // ✅ déjà inscrit -> ne rien faire (comme clubs)
    if (this.isRegistered(ev.idEvent)) {
      return; // ✅ pas popup, pas message
    }

    this.selectedEvent = ev;
    this.isConfirmOpen = true;
  }

  cancelRegisterConfirm() {
    this.isConfirmOpen = false;
    this.selectedEvent = null;
  }

  confirmRegister() {
    if (!this.selectedEvent?.idEvent) return;

    if (!this.currentUserId) {
      this.errorMsg = 'Utilisateur non connecté';
      this.cancelRegisterConfirm();
      return;
    }

    const eventId = Number(this.selectedEvent.idEvent);
    this.loadingEventId = eventId;
    this.errorMsg = '';
    this.successMsg = '';

    const payload = {
      eventId,
      userId: this.currentUserId,
      status: 'PENDING' as const
    };

    this.registrationService.createRegistration(payload).subscribe({
      next: () => {
        this.successMsg = 'Inscription créée ✅';
        this.joinedEventIds.add(eventId); // ✅ UI direct
        this.loadingEventId = null;
        this.cancelRegisterConfirm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingEventId = null;

        const msg =
          err?.error?.message ||
          err?.error?.error ||
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          '';

        const normalized = (msg || '').toLowerCase();
        if (normalized.includes('déjà') || normalized.includes('already') || normalized.includes('exists')) {
          this.joinedEventIds.add(eventId);
          this.cancelRegisterConfirm();
          this.cdr.detectChanges();
          return;
        }

        this.errorMsg = msg || 'Erreur inscription';
        this.cancelRegisterConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  isLoading(evId: number): boolean {
    return this.loadingEventId === Number(evId);
  }
}