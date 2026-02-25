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
        this.authService.getUserByEmail(this.loginData.email).subscribe({
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
            this.router.navigate(['/']);
          },
          error: () => {
            const token = this.authService.getToken();
            if (token) {
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const roles = payload.realm_access?.roles || [];
                if (roles.includes('ADMIN')) {
                  window.location.href = 'http://localhost:8083/back-office/';
                  return;
                }
                if (roles.includes('TEACHER')) {
                  window.location.href = 'http://localhost:8083/front-office/teacher.html';
                  return;
                }
              } catch (e) {
                console.error('Error decoding token:', e);
              }
            }
            this.router.navigate(['/']);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
}
