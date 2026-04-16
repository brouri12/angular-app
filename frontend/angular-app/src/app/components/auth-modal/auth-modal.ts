import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { LoginRequest, RegisterRequest } from '../../models/user.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrls: ['./auth-modal.css']
})
export class AuthModal implements OnInit {
  currentModal: 'login' | 'register' | null = null;

  // Login data
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  // Register data
  registerData: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
    nom: '',
    prenom: '',
    telephone: ''
  };

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  testUsersMessage = '';
  testUsersLoading = false;

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(modal => {
      this.currentModal = modal;
    });
  }

  closeModal() {
    this.resetForms();
    this.modalService.close();
  }

  switchToRegister() {
    this.modalService.openRegister();
  }

  switchToLogin() {
    this.modalService.openLogin();
  }

  resetForms() {
    this.loginData = { email: '', password: '' };
    this.registerData = {
      username: '',
      email: '',
      password: '',
      role: 'STUDENT',
      nom: '',
      prenom: '',
      telephone: ''
    };
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  // Login
  onLoginSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).pipe(
      finalize(() => {
        // Always reset loading state
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        console.log('Login successful!');
        const loginEmail = this.loginData.email || '';
        this.closeModal();
        this.cdr.detectChanges();

        // Intégration jasser11 : redirection par rôle + page my-groups (étudiant), tout en gardant Keycloak (rahali).
        this.authService.getUserByEmail(loginEmail).subscribe({
          next: (user) => {
            const role = String(user?.role || '').toUpperCase();
            if (role === 'ADMIN') {
              window.location.href = 'http://localhost:8083/back-office/';
              return;
            }
            if (role === 'TEACHER') {
              window.location.href = 'http://localhost:8083/front-office/teacher.html';
              return;
            }
            if (role === 'STUDENT') {
              this.ngZone.run(() => {
                this.router.navigate(['/my-groups']);
              });
              return;
            }
            this.authService.loadUser();
            setTimeout(() => window.location.reload(), 100);
          },
          error: () => {
            const token = this.authService.getToken();
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const roles = payload.realm_access?.roles || [];
                if (this.hasRole(roles, 'ADMIN')) {
                  window.location.href = 'http://localhost:8083/back-office/';
                  return;
                }
                if (this.hasRole(roles, 'TEACHER')) {
                  window.location.href = 'http://localhost:8083/front-office/teacher.html';
                  return;
                }
                if (this.hasRole(roles, 'STUDENT')) {
                  this.ngZone.run(() => {
                    this.router.navigate(['/my-groups']);
                  });
                  return;
                }
              } catch (e) {
                console.error('Error decoding token:', e);
              }
            }
            this.authService.loadUser();
            setTimeout(() => window.location.reload(), 100);
          }
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        const status = error?.status;
        if (status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (status === 0) {
          this.errorMessage = 'UserService (port 8085) non démarré. Lancez DEMARRER_USER_SERVICE.ps1 puis cliquez sur "Créer les comptes de test" si besoin.';
        } else if (status === 404) {
          this.errorMessage = 'Compte introuvable en base. Cliquez sur "Créer les comptes de test" puis réessayez.';
        } else if (error?.error?.error_description) {
          this.errorMessage = error.error.error_description;
        } else if (error?.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error?.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Connexion impossible. Démarrez UserService (8085) et Keycloak (9090), puis "Créer les comptes de test".';
        }
      }
    });
  }

  createTestUsers(): void {
    this.testUsersMessage = '';
    this.testUsersLoading = true;
    this.authService.ensureTestUsers().subscribe({
      next: (res) => {
        this.testUsersLoading = false;
        this.testUsersMessage = res.message || 'Comptes créés. Connectez-vous avec ppp@gmail.com / Ppp@123, alrahalimohamed3@gmail.com / Rahali@123, admin1772054577@wordly.com / Admin@123.';
        if (res.errors?.length) {
          this.testUsersMessage += ' Erreurs: ' + res.errors.join('; ');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.testUsersLoading = false;
        this.testUsersMessage = 'Erreur: ' + (err?.error?.error_description || err?.message || 'Keycloak ou UserService non démarré (9090, 8085).');
        this.cdr.detectChanges();
      }
    });
  }

  // Register
  onRegisterSubmit() {
    if (!this.validateRegisterForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = { ...this.registerData };
    if (request.role === 'STUDENT') {
      request.statut_etudiant = 'Inscrit';
    }

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.successMessage = '';
          this.errorMessage = '';
          this.modalService.openLogin();
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        
        // Extract detailed error message
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.details) {
          this.errorMessage = error.error.details;
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please check if Keycloak is running and try again.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  validateRegisterForm(): boolean {
    if (!this.registerData.username || !this.registerData.email || 
        !this.registerData.password || !this.registerData.nom || 
        !this.registerData.prenom) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    return true;
  }

  onRoleChange() {
    this.registerData.specialite = undefined;
    this.registerData.experience = undefined;
    this.registerData.disponibilite = undefined;
    this.registerData.date_naissance = undefined;
    this.registerData.niveau_actuel = undefined;
    this.registerData.statut_etudiant = undefined;
  }

  private hasRole(roles: string[], role: string): boolean {
    const r = role.toUpperCase();
    return roles.some((x) => String(x).toUpperCase() === r);
  }
}

