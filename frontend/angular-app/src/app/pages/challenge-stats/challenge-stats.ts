import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-challenge-stats',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './challenge-stats.html',
  styleUrl: './challenge-stats.css'
})
export class ChallengeStats implements OnInit {
  private challengeService = inject(ChallengeService);
  private authService = inject(AuthService);

  globalStats = signal<any>(null);
  userStats = signal<any>(null);
  leaderboard = signal<any[]>([]);
  loadingGlobal = signal(true);
  loadingUser = signal(true);
  loadingLeaderboard = signal(true);
  activeTab = signal<'overview' | 'leaderboard' | 'my-stats'>('overview');

  currentUser: any = null;

  // Level order for display
  levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  typeIcons: Record<string, string> = {
    VOCABULARY: '📚', GRAMMAR: '✍️', READING: '📖',
    LISTENING: '👂', WRITING: '📝', SPEAKING: '🗣️',
    IDIOMS: '💬', MIXED: '🎯'
  };

  ngOnInit() {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      if (u) this.loadUserStats((u.id_user || u.id) as number);
    });
    this.loadGlobalStats();
    this.loadLeaderboard();
  }

  loadGlobalStats() {
    this.loadingGlobal.set(true);
    this.challengeService.getGlobalStats().subscribe({
      next: (d) => { this.globalStats.set(d); this.loadingGlobal.set(false); },
      error: () => this.loadingGlobal.set(false)
    });
  }

  loadLeaderboard() {
    this.loadingLeaderboard.set(true);
    this.challengeService.getLeaderboard(20).subscribe({
      next: (d) => { this.leaderboard.set(d); this.loadingLeaderboard.set(false); },
      error: () => this.loadingLeaderboard.set(false)
    });
  }

  loadUserStats(userId: number) {
    this.loadingUser.set(true);
    this.challengeService.getUserStats(userId).subscribe({
      next: (d) => { this.userStats.set(d); this.loadingUser.set(false); },
      error: () => this.loadingUser.set(false)
    });
  }

  setTab(tab: 'overview' | 'leaderboard' | 'my-stats') {
    this.activeTab.set(tab);
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

  getLevelEntries(map: Record<string, number>) {
    if (!map) return [];
    return this.levelOrder
      .filter(l => map[l] !== undefined)
      .map(l => ({ key: l, value: map[l] }));
  }

  getTypeEntries(map: Record<string, number>) {
    if (!map) return [];
    return Object.entries(map).map(([k, v]) => ({ key: k, value: v }));
  }

  getMaxValue(entries: { value: number }[]): number {
    return Math.max(...entries.map(e => e.value), 1);
  }

  isCurrentUser(userId: number): boolean {
    return this.currentUser &&
      (this.currentUser.id_user === userId || this.currentUser.id === userId);
  }

  formatTime(seconds: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }
}
