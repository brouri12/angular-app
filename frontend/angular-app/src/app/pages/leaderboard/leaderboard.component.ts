import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PronunciationService } from '../../services/pronunciation.service';
import { AuthService } from '../../services/auth.service';

interface LeaderboardUser {
  rank: number;
  username: string;
  avgScore: number;
  totalRecordings: number;
  badgesCount: number;
  level: string;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 text-white">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-5xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Global Leaderboard
          </h1>
          <p class="text-xl text-slate-400">Top pronunciation masters</p>
        </div>

        <!-- Leaderboard Table -->
        <div class="bg-white/5 backdrop-blur border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <!-- Header Row -->
          <div class="grid grid-cols-[60px_repeat(4,1fr)_auto] gap-4 p-8 bg-white/10 font-black uppercase text-xs text-slate-400 tracking-wider">
            <div class="text-center">#</div>
            <div>Player</div>
            <div class="text-right">Avg Score</div>
            <div class="text-right">Recordings</div>
            <div class="text-right">Badges</div>
            <div class="text-right">Level</div>
            <div></div>
          </div>

          <!-- Loading -->
          <div *ngIf="loading()" class="flex items-center justify-center py-12">
            <div class="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Rows -->
          <div class="divide-y divide-white/5" *ngIf="!loading()">
            <div 
              *ngFor="let user of leaderboardData(); let i = index"
              class="grid grid-cols-[60px_repeat(4,1fr)_auto] gap-4 p-8 hover:bg-white/5 transition-all group">
              <div class="text-center font-black text-2xl" [class]="getRankColor(i)">
                {{ i + 1 }}
              </div>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center font-bold shadow-lg">
                  {{ user.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-bold">{{ user.username }}</p>
                  <p class="text-xs text-slate-500">{{ user.totalRecordings }} recordings</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-black text-emerald-400">{{ user.avgScore | number:'1.0-0' }}%</div>
                <p class="text-sm text-slate-500">Top {{ getRankPercentile(user.avgScore) }}%</p>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-indigo-400">{{ user.badgesCount }}</div>
              </div>
              <div class="text-right">
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {{ user.level }}
                </span>
              </div>
              <div class="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition">
                  Challenge
                </button>
              </div>
            </div>
            <div *ngIf="leaderboardData().length === 0" class="text-center py-12 text-slate-500">
              <p>No data available</p>
            </div>
          </div>
        </div>

        <!-- My Stats Card -->
        <div class="mt-12 grid md:grid-cols-3 gap-6">
          <div class="md:col-span-2 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center">
            <h3 class="text-2xl font-black mb-4">Your Position</h3>
            <div class="text-6xl font-black text-emerald-400 mb-4">#{{ myRank() }}</div>
            <div class="text-3xl font-black">{{ myAvgScore() | number:'1.0-0' }}%</div>
            <p class="text-slate-400 mt-2">You need {{ pointsToTop3() }}% to reach top 3</p>
          </div>
          <div class="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-8 text-center">
            <h3 class="text-xl font-black mb-4">Today's Challenge</h3>
            <p class="text-slate-400">Practice 'th' sounds</p>
            <button class="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg">
              Start Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  private svc = inject(PronunciationService);
  private auth = inject(AuthService);

  leaderboardData = signal<LeaderboardUser[]>([]);
  myRank = signal<number>(42);
  myAvgScore = signal<number>(82.5);
  pointsToTop3 = computed(() => Math.max(0, 95 - this.myAvgScore()));
  loading = signal<boolean>(false);
  selectedTab = 'global';

  ngOnInit(): void {
    this.loadLeaderboard();
    this.loadMyRank();
  }

  loadLeaderboard(): void {
    this.loading.set(true);
    this.svc.getLeaderboard().subscribe({
      next: (users: any[]) => {
        this.leaderboardData.set(
          users.map((u, i) => ({
            rank: i + 1,
            username: u.userId.toString(),
            avgScore: u.globalAverageScore,
            totalRecordings: u.totalRecordings,
            badgesCount: u.earnedBadges?.length || 0,
            level: u.estimatedLevel || 'A1'
          }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadMyRank(): void {
    const userId = Number(localStorage.getItem('userId') || '1');
    this.svc.getUserProgress(userId).subscribe({
      next: (progress: any) => {
        this.myAvgScore.set(progress.globalAverageScore ?? 75);
        this.myRank.set(Math.floor(Math.random() * 100) + 1);
      }
    });
  }

  getRankColor(index: number): string {
    if (index === 0) return 'text-amber-500 drop-shadow-amber-500/50';
    if (index === 1) return 'text-slate-400 drop-shadow-slate-400/50';
    if (index === 2) return 'text-amber-400 drop-shadow-amber-400/50';
    return 'text-white';
  }

  getRankPercentile(score: number): string {
    return Math.max(0, (100 - score * 0.8)).toFixed(0);
  }
}
