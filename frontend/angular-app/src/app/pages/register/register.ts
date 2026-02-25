import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
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
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare request based on role
    const request = { ...this.registerData };
    
    // Set default values for role-specific fields
    if (request.role === 'STUDENT') {
      request.statut_etudiant = 'Inscrit';
    }

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  validateForm(): boolean {
    // Check required fields
    if (!this.registerData.username || !this.registerData.email || 
        !this.registerData.password || !this.registerData.nom || 
        !this.registerData.prenom) {
      this.errorMessage = 'Please fill in all required fields';
      return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    // Check password length
    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return false;
    }

    // Check password confirmation
    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    return true;
  }

  onRoleChange(): void {
    // Reset role-specific fields when role changes
    this.registerData.specialite = undefined;
    this.registerData.experience = undefined;
    this.registerData.disponibilite = undefined;
    this.registerData.date_naissance = undefined;
    this.registerData.niveau_actuel = undefined;
    this.registerData.statut_etudiant = undefined;
  }
}
