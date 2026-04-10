import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Registration, RegistrationService } from '../../services/registration.service';
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
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = Number(param);

    if (!this.id || isNaN(this.id)) {
      this.errorMsg = "ID invalide dans l'URL";
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

        const eventTitle$ = this.registrationService.getEventTitleById(reg.eventId).pipe(
          catchError(() => of(''))
        );

        // ✅ Utiliser nom/prenom stockés directement (comme Member)
        const hasName = (reg.nom && reg.nom.trim()) || (reg.prenom && reg.prenom.trim());
        const userName$ = hasName
          ? of(([reg.prenom, reg.nom].filter(Boolean).join(' ').trim()))
          : this.registrationService.getUserNameById(reg.userId).pipe(
              catchError(() => of(`User #${reg.userId}`))
            );

        return forkJoin({ eventTitle: eventTitle$, userName: userName$ }).pipe(
          map(({ eventTitle, userName }) => ({ reg, eventTitle, userName }))
        );
      }),
      catchError((err) => {
        this.errorMsg = err?.error || 'Erreur GET registration';
        return of(null);
      })
    ).subscribe((result) => {
      if (result) {
        this.reg = { ...result.reg, eventTitle: result.eventTitle };
        this.userName = result.userName;
      }
      this.loading = false;
    });
  }

  save() {
    if (!this.reg) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const payload: Partial<Registration> = {
      eventId: this.reg.eventId,
      userId: this.reg.userId,
      status: this.reg.status
    };

    this.registrationService.update(this.reg.idRegistration, payload).pipe(
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
