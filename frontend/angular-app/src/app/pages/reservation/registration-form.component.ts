import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css'],
})
export class RegistrationFormComponent implements OnInit {
  eventId!: number;

  loading = false;
  errorMsg = '';
  successMsg = '';

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private registrationService: RegistrationService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      userId: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('eventId'));

    if (!this.eventId || isNaN(this.eventId)) {
      this.errorMsg = 'eventId invalide dans l’URL';
      return;
    }

    // ✅ Remplir userId automatiquement avec id_user
    const cachedUser = this.authService.getCurrentUserValue();

    if (cachedUser) {
      const userId = Number((cachedUser as any).id_user);
      if (userId) this.form.patchValue({ userId });
    } else {
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          const userId = Number((user as any).id_user);
          if (userId) this.form.patchValue({ userId });
        },
        error: () => {
          this.errorMsg = 'Utilisateur non connecté';
        }
      });
    }
  }

  submit(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      eventId: this.eventId,
      userId: this.form.value.userId
    };

    this.registrationService.createRegistration(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Inscription créée ✅';

        setTimeout(() => {
          this.router.navigate(['/events']);
        }, 700);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error || 'Erreur inscription';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/events']);
  }
}