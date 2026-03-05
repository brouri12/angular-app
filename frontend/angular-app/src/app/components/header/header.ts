import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class Header implements OnInit {
  mobileMenuOpen = false;
  userMenuOpen = false;
  currentUser: User | null = null;
  isAuthenticated = false;

  navLinks = [
    { name: 'Courses', path: '/courses' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Clubs', path: '/clubs' },
  ];

  constructor(
    public themeService: Theme,
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.cdr.detectChanges(); // ✅ fix NG0100
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.detectChanges(); // ✅ fix NG0100
    });
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