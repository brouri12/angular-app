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
        this.closeModal();
        this.cdr.detectChanges();
        
        // Get user role and redirect accordingly
        const token = this.authService.getToken();
        if (token) {
          try {
            // Decode token to get role
            const payload = JSON.parse(atob(token.split('.')[1]));
            const roles = payload.realm_access?.roles || [];
            
            // Check if user is TEACHER or STUDENT
            if (roles.includes('TEACHER') || roles.includes('STUDENT')) {
              // Redirect to frontend
              window.location.href = 'http://localhost:4200';
            } else {
              // ADMIN - stay on back-office and navigate to dashboard
              this.authService.loadUser();
              setTimeout(() => {
                this.router.navigate(['/dashboard']).then(() => {
                  window.location.reload();
                });
              }, 100);
            }
          } catch (e) {
            console.error('Error decoding token:', e);
            // Fallback: navigate to dashboard
            this.authService.loadUser();
            setTimeout(() => {
              this.router.navigate(['/dashboard']).then(() => {
                window.location.reload();
              });
            }, 100);
          }
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        
        // Extract detailed error message
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 404) {
          this.errorMessage = 'User not found with this email';
        } else if (error.error?.error_description) {
          this.errorMessage = error.error.error_description;
        } else if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Login failed. Please check if all services are running.';
        }
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

    console.log('Submitting registration:', request);

    this.authService.register(request).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
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
        console.error('Registration error:', error);
        this.isLoading = false;
        
        // Extract detailed error message
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.details) {
          this.errorMessage = error.error.details;
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please check if Keycloak is running and try again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Network error. Please check your connection and try again.';
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
}
