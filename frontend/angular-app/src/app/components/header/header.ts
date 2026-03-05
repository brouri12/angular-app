import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Theme } from '../../services/theme';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { User } from '../../models/user.model';
import { SubscriptionReminders } from '../subscription-reminders/subscription-reminders';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, SubscriptionReminders],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  mobileMenuOpen = false;
  userMenuOpen = false;
  currentUser: User | null = null;
  isAuthenticated = false;

  navLinks = [
    { name: 'Courses', path: '/courses' },
    { name: 'Challenges', path: '/challenges' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];

  constructor(
    public themeService: Theme,
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router
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

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  openLogin() {
    this.modalService.openLogin();
    this.mobileMenuOpen = false;
  }

  openRegister() {
    this.modalService.openRegister();
    this.mobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}
