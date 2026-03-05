import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Registration, RegistrationService } from '../../services/registration.service';
import { catchError, of, switchMap, map } from 'rxjs';

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

  loading = false;
  errorMsg = '';
  successMsg = '';

  statuses: RegistrationStatus[] = ['PENDING', 'CONFIRMED', 'CANCELED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = Number(param);

    if (!this.id || isNaN(this.id)) {
      this.errorMsg = 'ID invalide dans l’URL';
      return;
    }

    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.registrationService.getById(this.id).pipe(
      switchMap((data) => {
        const reg = data as Registration;

        return this.registrationService.getEventTitleById(reg.eventId).pipe(
          catchError(() => of('')),
          map((title) => ({ ...reg, eventTitle: title }))
        );
      }),
      catchError((err) => {
        this.errorMsg = err?.error || 'Erreur GET registration';
        return of(null);
      })
    ).subscribe((finalReg) => {
      this.reg = finalReg;
      this.loading = false;
    });
  }

  // ✅ FIX UPDATE
  save() {
    if (!this.reg) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    // ✅ PUT => payload COMPLET (recommandé)
    const payload: Partial<Registration> = {
      eventId: this.reg.eventId,
      userId: this.reg.userId,
      status: this.reg.status
      // (optionnel) si ton backend l'accepte:
      // idRegistration: this.reg.idRegistration
    };

    const idToUpdate = this.reg.idRegistration; // ✅ l'id réel backend

    this.registrationService.update(idToUpdate, payload).pipe(
      catchError((err) => {
        this.errorMsg = err?.error || 'Erreur UPDATE';
        return of(null);
      })
    ).subscribe((res) => {
      this.loading = false;

      if (res !== null) {
        this.successMsg = '✅ Registration modifiée avec succès';
        setTimeout(() => this.router.navigate(['/registrations']), 700);
      }
    });
  }

  cancel() {
    this.router.navigate(['/registrations']);
  }
}
