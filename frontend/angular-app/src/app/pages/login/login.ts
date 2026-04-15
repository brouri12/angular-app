import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;
  testUsersMessage = '';
  testUsersLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading = false;
        const token = this.authService.getToken();
        const tokenParam = token ? '?token=' + encodeURIComponent(token) : '';
        const loginEmail = this.loginData.email || '';
        const emailParam = loginEmail ? (tokenParam ? '&' : '?') + 'email=' + encodeURIComponent(loginEmail) : '';

        // Tous les comptes ouvrent l'espace étudiant
        const studentUrl = 'http://localhost:8083/front-office/student.html' + tokenParam + emailParam;
        setTimeout(() => { window.location.href = studentUrl; }, 250);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        const status = error?.status;
        const desc = error?.error?.error_description;
        if (status === 0) {
          this.errorMessage = 'UserService (port 8085) non démarré ou bloqué. Démarrez-le puis réessayez.';
          return;
        }
        if (status === 404) {
          this.errorMessage = 'Compte introuvable en base. Cliquez sur « Créer les comptes de test » puis réessayez.';
          return;
        }
        if (status === 500 && (desc === 'unknown_error' || !desc)) {
          this.errorMessage = 'Keycloak a renvoyé une erreur interne (HTTP 500). Relancez Keycloak (9090) avec le script CORRIGER_ET_DEMARRER_KEYCLOAK, puis AUTO_CONFIGURE_KEYCLOAK et CREER_COMPTES_KEYCLOAK.';
          return;
        }
        this.errorMessage = desc || error?.error?.error || error?.message || 'Invalid email or password';
      }
    });
  }

  createTestUsers(): void {
    this.testUsersMessage = '';
    this.testUsersLoading = true;
    this.authService.ensureTestUsers().subscribe({
      next: (res) => {
        this.testUsersLoading = false;
        this.testUsersMessage = res.message || 'Comptes créés. Connectez-vous avec : ppp@gmail.com / Ppp@123 (Teacher), alrahalimohamed3@gmail.com / Rahali@123 (Student), admin1772054577@wordly.com / Admin@123 (Admin).';
        if (res.errors?.length) {
          this.testUsersMessage += ' Erreurs: ' + res.errors.join('; ');
        }
      },
      error: (err) => {
        this.testUsersLoading = false;
        this.testUsersMessage = 'Erreur: ' + (err?.error?.error_description || err?.message || 'Keycloak ou UserService non démarré (9090, 8085).');
      }
    });
  }
}
