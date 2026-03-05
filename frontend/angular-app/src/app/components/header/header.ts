import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Theme } from '../../services/theme';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  mobileMenuOpen = false;

  navLinks = [
    { name: 'HEADER.COURSES', anchor: 'courses' },
    { name: 'HEADER.FORUMS', anchor: 'forums' },
    { name: 'HEADER.RECRUITMENT', anchor: 'recruitment' },
    { name: 'HEADER.PRICING', anchor: 'pricing' },
    { name: 'HEADER.ABOUT', anchor: 'about' },
  ];

  constructor(public themeService: Theme) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  scrollToSection(anchor: string) {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.mobileMenuOpen = false;
    }
  }
}
