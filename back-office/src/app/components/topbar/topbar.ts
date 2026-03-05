import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Theme } from '../../services/theme';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  userMenuOpen = false;
  currentUser: User | null = null;
  isAuthenticated = false;

  constructor(
    public themeService: Theme,
    private authService: AuthService,
    private modalService: ModalService
  ) {
    // Subscribe to authentication state
    this.authService.isAuthenticated$.subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    // Subscribe to current user
    this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  openLogin() {
    this.modalService.openLogin();
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen = false;
  }
}
