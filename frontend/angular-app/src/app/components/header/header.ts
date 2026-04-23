import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Theme } from '../../services/theme';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { ChallengeService } from '../../services/challenge.service';
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
  challengesPanelOpen = false;
  currentUser: User | null = null;
  isAuthenticated = false;
  userSubmissions: any[] = [];
  loadingSubmissions = false;

  navLinks = [
    { name: 'Courses', path: '/courses' },
    { name: 'Events', path: '/events' },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Challenges', path: '/challenges' },
    { name: 'Stats', path: '/challenge-stats' },
    { name: 'My Group', path: '/my-groups' },
    { name: 'Forums', path: '/forums' },
    { name: 'Recrutement', path: '/recrutement' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];

  constructor(
    public themeService: Theme,
    private authService: AuthService,
    private modalService: ModalService,
    private challengeService: ChallengeService,
    public router: Router
  ) {
    this.authService.isAuthenticated$.subscribe(isAuth => this.isAuthenticated = isAuth);
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.challengesPanelOpen = false;
    }
  }

  closeUserMenu() {
    this.userMenuOpen = false;
    this.challengesPanelOpen = false;
  }

  toggleChallengesPanel() {
    this.challengesPanelOpen = !this.challengesPanelOpen;
    if (this.challengesPanelOpen && this.currentUser) {
      this.loadUserSubmissions();
    }
  }

  loadUserSubmissions() {
    const userId = this.currentUser?.id_user || this.currentUser?.id;
    if (!userId) return;
    this.loadingSubmissions = true;
    this.challengeService.getUserSubmissionsWithChallenge(userId).subscribe({
      next: (data) => {
        // Group by challengeId, keep best score per challenge
        const map = new Map<number, any>();
        data.forEach((s: any) => {
          const existing = map.get(s.challengeId);
          if (!existing || s.score > existing.score) {
            map.set(s.challengeId, s);
          }
        });
        this.userSubmissions = Array.from(map.values())
          .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        this.loadingSubmissions = false;
      },
      error: () => this.loadingSubmissions = false
    });
  }

  getStatusIcon(status: string): string {
    if (status === 'PASSED') return '✅';
    if (status === 'PARTIAL') return '⚠️';
    return '❌';
  }

  getStatusColor(status: string): string {
    if (status === 'PASSED') return 'text-green-600 dark:text-green-400';
    if (status === 'PARTIAL') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }

  getProgressBarColor(pct: number): string {
    if (pct >= 70) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
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
    this.challengesPanelOpen = false;
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.userMenuOpen = false;
      this.challengesPanelOpen = false;
    }
  }
}
