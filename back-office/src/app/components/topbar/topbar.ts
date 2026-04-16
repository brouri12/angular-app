import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Theme } from '../../services/theme';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  userMenuOpen = false;
  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(
    public themeService: Theme,
    private authService: AuthService
  ) {
    this.isAuthenticated = this.authService.isLoggedIn();
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = user !== null;
    });
  }

  openLogin() {
    // Simple alert for demo - no complex auth modal
    alert('Login functionality disabled in game-only mode');
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen = false;
  }
}
