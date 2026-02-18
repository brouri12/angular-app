import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Theme } from '../../services/theme';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  mobileMenuOpen = false;

  navLinks = [
    { name: 'Courses', path: '/courses' },
    { name: 'Forums', path: '/forums' },
    { name: 'Recrutement', path: '/recrutement' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];

  constructor(public themeService: Theme) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
