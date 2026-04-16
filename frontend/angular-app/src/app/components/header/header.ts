import { Component, OnInit, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Theme } from '../../services/theme';
import { HttpClient } from '@angular/common/http';

interface PlayerSession {
  userId: string;
  lives: number;
  level: number;
  progressBar: number;
  totalXP: number;
  winStreak: number;
  gamesWon: number;
  totalGamesPlayed: number;
}

interface RecentSubmission {
  id: number;
  gameId: number;
  status: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  mobileMenuOpen = false;
  userMenuOpen = false;
  gamesPanelOpen = false;
  userSession = signal<PlayerSession | null>(null);
  recentSubmissions = signal<RecentSubmission[]>([]);
  loadingSubmissions = false;

  navLinks = [
    { name: 'Courses', path: '/courses' },
    { name: 'Game Zone', path: '/games' },
    { name: 'Progress', path: '/progress' },
    { name: 'About', path: '/about' },
  ];

  constructor(
    public themeService: Theme,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadUserSession();
    setInterval(() => this.loadUserSession(), 30000);
  }

  loadUserSession() {
    this.http.get<PlayerSession>('http://localhost:9001/api/session').subscribe({
      next: s => this.userSession.set(s),
      error: () => this.userSession.set(null)
    });
  }

  loadRecentSubmissions() {
    this.loadingSubmissions = true;
    this.http.get<RecentSubmission[]>('http://localhost:9001/api/submissions/user/default-user').subscribe({
      next: subs => {
        this.recentSubmissions.set(subs.slice(0, 5));
        this.loadingSubmissions = false;
      },
      error: () => { this.recentSubmissions.set([]); this.loadingSubmissions = false; }
    });
  }

  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) { this.gamesPanelOpen = false; }
  }

  closeUserMenu() { this.userMenuOpen = false; this.gamesPanelOpen = false; }

  toggleGamesPanel() {
    this.gamesPanelOpen = !this.gamesPanelOpen;
    if (this.gamesPanelOpen) this.loadRecentSubmissions();
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

  getHearts(): string[] {
    const lives = this.userSession()?.lives ?? 3;
    return Array.from({ length: 3 }, (_, i) => i < lives ? '❤️' : '🖤');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.userMenuOpen = false;
      this.gamesPanelOpen = false;
    }
  }
}
