import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, finalize } from 'rxjs/operators';
import { Registration, RegistrationAdminService } from '../../services/registration-admin.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

@Component({
  selector: 'app-registrations-admin',
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
  confirmOpen = false;
  selectedRegistration: Registration | null = null;

  constructor(
    private registrationService: RegistrationAdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll() {
    this.loadingList = true; this.errorMsg = '';
    this.registrationService.getAll().pipe(
      switchMap((regs) => {
        if (!regs || regs.length === 0) return of([]);
        const calls = regs.map((r) => {
          const eventTitle$ = r.eventId ? this.registrationService.getEventTitleById(r.eventId).pipe(catchError(() => of(`Event #${r.eventId}`))) : of('Unknown Event');
          const hasName = (r.nom && r.nom.trim()) || (r.prenom && r.prenom.trim());
          const userName$ = hasName ? of(([r.prenom, r.nom].filter(Boolean).join(' ').trim())) : (r.userId ? this.registrationService.getUserNameById(r.userId).pipe(catchError(() => of(`User #${r.userId}`))) : of('Unknown User'));
          return forkJoin({ eventTitle: eventTitle$, userName: userName$ }).pipe(map(({ eventTitle, userName }) => ({ ...r, eventTitle, userName })));
        });
        return forkJoin(calls);
      }),
      finalize(() => (this.loadingList = false))
    ).subscribe({
      next: (data) => { this.registrations = data; this.applyFilters(); },
      error: (err) => { this.errorMsg = err?.error || 'Error loading registrations'; }
    });
  }

  applyFilters() {
    const txt = (this.searchText || '').toLowerCase().trim();
    const status = (this.statusFilter || '').toUpperCase().trim();
    const eventName = (this.eventNameFilter || '').toLowerCase().trim();
    this.filtered = (this.registrations || []).filter((r: Registration) => {
      if (eventName && !(r.eventTitle || '').toLowerCase().includes(eventName)) return false;
      if (status && (r.status || '').toUpperCase() !== status) return false;
      if (!txt) return true;
      return `${r.eventTitle || ''} ${r.userId || ''} ${r.registrationDate || ''} ${r.status || ''}`.toLowerCase().includes(txt);
    });
  }

  resetFilters() { this.searchText = ''; this.statusFilter = ''; this.eventNameFilter = ''; this.applyFilters(); }
  openEdit(r: Registration) { this.router.navigate([r.idRegistration, 'edit'], { relativeTo: this.route }); }
  openDeleteModal(r: Registration) { this.selectedRegistration = r; this.confirmOpen = true; }

  confirmDelete() {
    if (!this.selectedRegistration?.idRegistration) return;
    this.loadingAction = true; this.errorMsg = '';
    const id = this.selectedRegistration.idRegistration;
    this.registrationService.delete(id).pipe(finalize(() => (this.loadingAction = false))).subscribe({
      next: () => { this.registrations = this.registrations.filter(x => x.idRegistration !== id); this.applyFilters(); this.confirmOpen = false; this.selectedRegistration = null; },
      error: (err) => { this.errorMsg = err?.error || 'Delete error'; this.confirmOpen = false; this.selectedRegistration = null; }
    });
  }

  cancelDelete() { this.confirmOpen = false; this.selectedRegistration = null; }
  statusClass(s?: string) { return (s || '').toLowerCase(); }
}
