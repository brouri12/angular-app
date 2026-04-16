import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Theme } from '../../services/theme';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  mobileMenuOpen = false;
  userMenuOpen = false;
  currentUser: User | null = null;
  isAuthenticated = false;

  navLinks = [
    { name: 'Accueil', path: '/home' },
    { name: 'Courses', path: '/courses' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];

  // Dynamic nav links based on user role
  get displayNavLinks() {
    if (this.isAuthenticated && this.currentUser?.role === 'STUDENT') {
      return [
        { name: 'My Groups', path: '/my-groups' },
        { name: 'Courses', path: '/courses' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'About', path: '/about' },
      ];
    }
    return this.navLinks;
  }

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

  /** Lien vers le back-office (8083) avec token si connecté, pour que le lien fonctionne. */
  get backOfficeUrl(): string {
    const base = 'http://localhost:8083/back-office/';
    const token = this.authService.getToken();
    return token ? base + '?token=' + encodeURIComponent(token) : base;
  }
}
