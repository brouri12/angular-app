import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';

import { Registration, RegistrationService } from '../../services/registration.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, JoinConfirmModalComponent],
  templateUrl: './registrations.component.html',
  styleUrls: ['./registrations.component.css'],
})
export class RegistrationsComponent implements OnInit {

  registrations: Registration[] = [];
  filtered: Registration[] = [];

  loadingList = false;
  loadingAction = false;
  errorMsg = '';

  searchText = '';
  statusFilter = '';
eventNameFilter = '';
  // ✅ MODAL DELETE (comme Clubs)
  confirmOpen = false;
  selectedRegistration: Registration | null = null;

  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.loadingList = true;
    this.errorMsg = '';

    this.registrationService.getAll().pipe(
      switchMap((regs) => {
        if (!regs || regs.length === 0) return of([]);

        const calls = regs.map((r) => {
          const eventTitle$ = r.eventId
            ? this.registrationService.getEventTitleById(r.eventId).pipe(
                catchError(() => of(`Event #${r.eventId}`))
              )
            : of('Unknown Event');

          const userName$ = r.userId
            ? this.registrationService.getUserNameById(r.userId).pipe(
                catchError(() => of(`User #${r.userId}`))
              )
            : of('Unknown User');

          return forkJoin({ eventTitle: eventTitle$, userName: userName$ }).pipe(
            map(({ eventTitle, userName }) => ({
              ...r,
              eventTitle,
              userName
            }))
          );
        });

        return forkJoin(calls);
      }),
      finalize(() => (this.loadingList = false))
    ).subscribe({
      next: (data) => {
        this.registrations = data;
        this.applyFilters();
      },
      error: (err) => {
        this.errorMsg = err?.error || 'Erreur GET registrations';
      }
    });
  }

  applyFilters() {
  const txt = (this.searchText || '').toLowerCase().trim();
  const status = (this.statusFilter || '').toUpperCase().trim();
  const eventName = (this.eventNameFilter || '').toLowerCase().trim();

  this.filtered = (this.registrations || []).filter((r: Registration) => {

    // 🔎 filtre par event name
    if (eventName && !(r.eventTitle || '').toLowerCase().includes(eventName)) {
      return false;
    }

    // 🔎 filtre par status
    if (status && (r.status || '').toUpperCase() !== status) {
      return false;
    }

    // 🔎 search général
    if (!txt) return true;

    const eventTitle = (r.eventTitle || '').toLowerCase();
    const userId = String(r.userId ?? '').toLowerCase();
    const date = String(r.registrationDate ?? '').toLowerCase();
    const st = String(r.status ?? '').toLowerCase();

    return (
      eventTitle.includes(txt) ||
      userId.includes(txt) ||
      date.includes(txt) ||
      st.includes(txt)
    );
  });
}

  resetFilters() {
    this.searchText = '';
    this.statusFilter = '';
this.eventNameFilter = '';
    this.applyFilters();
  }

  openEdit(r: Registration) {
    this.router.navigate([r.idRegistration, 'edit'], { relativeTo: this.route });
  }

  // ✅ OUVRIR MODAL DELETE
  openDeleteModal(r: Registration) {
    this.selectedRegistration = r;
    this.confirmOpen = true;
  }

  // ✅ CONFIRMER DELETE (même logique que Clubs)
  confirmDelete() {
    if (!this.selectedRegistration?.idRegistration) return;

    this.loadingAction = true;
    this.errorMsg = '';

    const id = this.selectedRegistration.idRegistration;

    this.registrationService.delete(id)
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: () => {
          // suppression locale immédiate
          this.registrations = this.registrations.filter(x => x.idRegistration !== id);
          this.applyFilters();

          // fermer modal
          this.confirmOpen = false;
          this.selectedRegistration = null;
        },
        error: (err) => {
          const status = err?.status ? ` (status ${err.status})` : '';
          this.errorMsg = (err?.error || 'Erreur lors de la suppression') + status;

          // fermer modal
          this.confirmOpen = false;
          this.selectedRegistration = null;
        }
      });
  }

  // ✅ ANNULER DELETE
  cancelDelete() {
    this.confirmOpen = false;
    this.selectedRegistration = null;
  }

  statusClass(s?: string) {
    return (s || '').toLowerCase(); // pending / confirmed / canceled
  }
}