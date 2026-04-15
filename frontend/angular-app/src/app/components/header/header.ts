import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Theme } from '../../services/theme';
import { keycloak } from '../../../main';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  mobileMenuOpen = false;

  get navLinks() {
    if (!keycloak.authenticated || !keycloak.tokenParsed) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'About', path: '/about' }
      ];
    }

    const roles = keycloak.tokenParsed.realm_access?.roles || [];
    const isStudent = roles.includes('student');
    const isTuteur = roles.includes('tuteur');

    if (isTuteur) {
      // test-tuteur: TUTEUR SEULEMENT
      return [
        { name: 'Tuteur', path: '/tuteur' }
      ];
    }

    if (isStudent) {
      // test-student: Student + Feedbacks + Reclamations + Leaderboard STRICT
      return [
        { name: 'Student', path: '/student' },
        { name: 'Feedbacks', path: '/feedbacks' },
        { name: 'Reclamations', path: '/reclamations' },
        { name: 'Leaderboard', path: '/leaderboard' }
      ];
    }

    // Default
    return [
      { name: 'Home', path: '/' },
      { name: 'Courses', path: '/courses' },
      { name: 'Pricing', path: '/pricing' },
      { name: 'About', path: '/about' }
    ];
  }

  constructor(public themeService: Theme) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  login() {
    keycloak.login();
  }

  logout() {
    keycloak.logout();
  }

  isLoggedIn(): boolean {
    return keycloak.authenticated || !!keycloak.token;
  }

  getUsername(): string {
    return keycloak.tokenParsed?.['preferred_username'] || '';
  }
}
