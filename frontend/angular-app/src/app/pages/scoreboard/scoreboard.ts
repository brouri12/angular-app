import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const BASE = `${environment.gameServiceUrl}/api`;

interface PlayerSession {
  userId: string;
  level: number;
  progressBar: number;
  totalXP: number;
  winStreak: number;
  bestStreak: number;
  gamesWon: number;
  gamesLost: number;
  totalGamesPlayed: number;
}

interface Submission {
  id: number;
  gameId: number;
  gameTitle?: string;
  status: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  completionTime?: number;
  feedback?: string;
}

interface Trophy {
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  color: string;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.css'
})
export class ScoreboardPage implements OnInit {
  session = signal<PlayerSession | null>(null);
  history = signal<Submission[]>([]);
  loading = signal(true);

  trophies = computed<Trophy[]>(() => {
    const s = this.session();
    const h = this.history();
    if (!s) return [];

    const passed = h.filter(x => x.status === 'PASSED').length;
    const perfect = h.filter(x => x.percentage === 100).length;
    const hasHard = h.some(x => x.percentage >= 90);

    return [
      {
        icon: '🏆', title: 'First Victory',
        description: 'Win your first game',
        earned: s.gamesWon >= 1,
        color: 'from-yellow-400 to-orange-500'
      },
      {
        icon: '🔥', title: 'On Fire',
        description: 'Achieve a 3-game win streak',
        earned: s.bestStreak >= 3,
        color: 'from-orange-400 to-red-500'
      },
      {
        icon: '⭐', title: 'Star Player',
        description: 'Win 5 games',
        earned: s.gamesWon >= 5,
        color: 'from-yellow-300 to-yellow-500'
      },
      {
        icon: '💎', title: 'Diamond',
        description: 'Reach Level 5',
        earned: s.level >= 5,
        color: 'from-blue-400 to-cyan-500'
      },
      {
        icon: '🎯', title: 'Sharpshooter',
        description: 'Score 90%+ accuracy',
        earned: hasHard,
        color: 'from-green-400 to-emerald-500'
      },
      {
        icon: '💯', title: 'Perfectionist',
        description: 'Get a perfect 100% score',
        earned: perfect >= 1,
        color: 'from-purple-400 to-pink-500'
      },
      {
        icon: '🚀', title: 'Rocket',
        description: 'Earn 200+ total XP',
        earned: s.totalXP >= 200,
        color: 'from-indigo-400 to-purple-500'
      },
      {
        icon: '👑', title: 'Champion',
        description: 'Win 10 games',
        earned: s.gamesWon >= 10,
        color: 'from-yellow-500 to-amber-600'
      },
      {
        icon: '⚡', title: 'Lightning',
        description: 'Achieve a 5-game win streak',
        earned: s.bestStreak >= 5,
        color: 'from-yellow-300 to-orange-400'
      }
    ];
  });

  earnedTrophies = computed(() => this.trophies().filter(t => t.earned));
  lockedTrophies = computed(() => this.trophies().filter(t => !t.earned));

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<PlayerSession>(`${BASE}/session`).subscribe({
      next: s => { this.session.set(s); this.loadHistory(); },
      error: () => this.loading.set(false)
    });
  }

  loadHistory() {
    this.http.get<Submission[]>(`${BASE}/submissions/user/default-user`).subscribe({
      next: h => { this.history.set(h); this.loading.set(false); },
      error: () => this.loading.set(false)
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

  getAccuracyBar(pct: number): string {
    if (pct >= 70) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (pct >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-rose-500';
  }

  formatTime(seconds?: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getWinRate(): number {
    const s = this.session();
    if (!s || s.totalGamesPlayed === 0) return 0;
    return Math.round((s.gamesWon / s.totalGamesPlayed) * 100);
  }
}
