import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

const BASE = 'http://localhost:9001/api';

interface UserStats {
  userId: string;
  totalScore: number;
  totalGamesPlayed: number;
  totalGamesPassed: number;
  totalGamesFailed: number;
  passRate: number;
  overallAccuracy: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  progressBar: number;
  totalXP: number;
}

interface UserRank {
  rank: number;
  userId: string;
  totalScore: number;
  gamesPassed: number;
  passRate: number;
  level: number;
  winStreak: number;
}

interface GlobalStats {
  totalGames: number;
  totalSubmissions: number;
  totalPlayers: number;
  globalPassRate: number;
  globalAverageScore: number;
  leaderboard: UserRank[];
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './progress.html',
  styleUrl: './progress.css'
})
export class ProgressPage implements OnInit {
  activeTab = signal<'overview' | 'leaderboard' | 'my-stats'>('overview');

  globalStats = signal<GlobalStats | null>(null);
  userStats = signal<UserStats | null>(null);
  leaderboard = signal<UserRank[]>([]);

  loadingGlobal = signal(true);
  loadingUser = signal(true);
  loadingLeaderboard = signal(true);

  readonly userId = 'default-user';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadGlobalStats();
    this.loadLeaderboard();
    this.loadUserStats();
  }

  loadGlobalStats() {
    this.loadingGlobal.set(true);
    this.http.get<GlobalStats>(`${BASE}/stats/global`).subscribe({
      next: d => { this.globalStats.set(d); this.loadingGlobal.set(false); },
      error: () => this.loadingGlobal.set(false)
    });
  }

  loadLeaderboard() {
    this.loadingLeaderboard.set(true);
    this.http.get<UserRank[]>(`${BASE}/stats/leaderboard?limit=20`).subscribe({
      next: d => { this.leaderboard.set(d); this.loadingLeaderboard.set(false); },
      error: () => this.loadingLeaderboard.set(false)
    });
  }

  loadUserStats() {
    this.loadingUser.set(true);
    this.http.get<UserStats>(`${BASE}/stats/users/${this.userId}`).subscribe({
      next: d => { this.userStats.set(d); this.loadingUser.set(false); },
      error: () => this.loadingUser.set(false)
    });
  }

  setTab(tab: string) {
    this.activeTab.set(tab as 'overview' | 'leaderboard' | 'my-stats');
  }

  getInitial(userId: string | undefined): string {
    return userId ? userId.charAt(0).toUpperCase() : '?';
  }

  getRankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  getPassRateColor(rate: number): string {
    if (rate >= 70) return 'text-green-600 dark:text-green-400';
    if (rate >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }

  getBarColor(rate: number): string {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  isCurrentUser(uid: string): boolean {
    return uid === this.userId;
  }

  formatTime(seconds: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  getPerformanceBadge(): { icon: string; label: string; color: string } {
    const pct = this.userStats()?.passRate || 0;
    if (pct === 100) return { icon: '🏆', label: 'Perfect!', color: 'text-yellow-600' };
    if (pct >= 90) return { icon: '⭐', label: 'Excellent!', color: 'text-green-600' };
    if (pct >= 70) return { icon: '👍', label: 'Good Job!', color: 'text-blue-600' };
    if (pct >= 50) return { icon: '💪', label: 'Keep Going', color: 'text-orange-600' };
    return { icon: '📚', label: 'Keep Practicing', color: 'text-red-600' };
  }
}
