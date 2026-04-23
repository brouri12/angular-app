import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Registration, RegistrationAdminService } from '../../services/registration-admin.service';
import { catchError, forkJoin, of, switchMap, map } from 'rxjs';

type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED';

@Component({
  selector: 'app-registration-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './registration-edit.component.html',
  styleUrls: ['./registration-edit.component.css']
})
export class RegistrationEditComponent implements OnInit {
  id!: number;
  reg: Registration | null = null;
  userName = '';
  loading = false;
  errorMsg = '';
  successMsg = '';
  statuses: RegistrationStatus[] = ['PENDING', 'CONFIRMED', 'CANCELED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: RegistrationAdminService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = Number(param);
    if (!this.id || isNaN(this.id)) { this.errorMsg = 'Invalid ID in URL'; return; }
    this.load();
  }

  load() {
    this.loading = true; this.errorMsg = ''; this.successMsg = '';
    this.registrationService.getById(this.id).pipe(
      switchMap((data) => {
        const reg = data as Registration;
        const eventTitle$ = this.registrationService.getEventTitleById(reg.eventId).pipe(catchError(() => of('')));
        const hasName = (reg.nom && reg.nom.trim()) || (reg.prenom && reg.prenom.trim());
        const userName$ = hasName ? of(([reg.prenom, reg.nom].filter(Boolean).join(' ').trim())) : this.registrationService.getUserNameById(reg.userId).pipe(catchError(() => of(`User #${reg.userId}`)));
        return forkJoin({ eventTitle: eventTitle$, userName: userName$ }).pipe(map(({ eventTitle, userName }) => ({ reg, eventTitle, userName })));
      }),
      catchError((err) => { this.errorMsg = err?.error || 'Error loading registration'; return of(null); })
    ).subscribe((result) => {
      if (result) { this.reg = { ...result.reg, eventTitle: result.eventTitle }; this.userName = result.userName; }
      this.loading = false;
    });
  }

  save() {
    if (!this.reg) return;
    this.loading = true; this.errorMsg = ''; this.successMsg = '';
    this.registrationService.update(this.reg.idRegistration, { eventId: this.reg.eventId, userId: this.reg.userId, status: this.reg.status }).pipe(catchError((err) => { this.errorMsg = err?.error || 'Update error'; return of(null); })).subscribe((res) => {
      this.loading = false;
      if (res !== null) { this.successMsg = '✅ Registration updated'; setTimeout(() => this.router.navigate(['/registrations']), 700); }
    });
  }

  cancel() { this.router.navigate(['/registrations']); }
}
