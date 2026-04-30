import {
  Component, OnInit, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LevelColorPipe } from '../../../../../pipes/Pronunciation.pipes';
import { PronunciationChallenge, NiveauCECRL, ChallengeType } from '../../../../../shared/models/pronunciation.types';
import { PronunciationService } from '../../../../services/pronunciation.service';


@Component({
  selector: 'app-challenge-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LevelColorPipe],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0e0e1a] to-[#12121f] text-white font-['Inter',system-ui,sans-serif]">
      <!-- ========== HEADER ========== -->
      <header class="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a14]/80 border-b border-white/10">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <a routerLink="/student/my-recordings"
             class="flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 text-sm font-medium hover:scale-105">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            My Recordings
          </a>
        </div>
      </header>

      <!-- ========== HERO SECTION ========== -->
      <section class="relative pt-12 pb-8 md:pt-20 md:pb-12 overflow-hidden">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div class="max-w-7xl mx-auto px-6 text-center md:text-left">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide mb-4">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                AI‑powered pronunciation coach
              </div>
              <h1 class="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Speak with
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">confidence</span>
              </h1>
              <p class="text-slate-400 text-lg mt-4 max-w-2xl">Practice real phrases, get instant feedback, and track your progress.</p>
            </div>
            <div class="flex gap-4 justify-center md:justify-end">
              <div class="bg-white/5 rounded-2xl px-6 py-4 border border-white/10 backdrop-blur-sm text-center">
                <div class="text-3xl font-black text-violet-400">{{ challenges().length }}</div>
                <div class="text-xs text-slate-400 uppercase tracking-wide">active challenges</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========== SWIPER CAROUSEL (static images/videos) ========== -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span class="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></span>
            Explore features
          </h2>
          <div class="text-xs text-slate-500 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
            swipe to explore
          </div>
        </div>
        <div class="overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-6 pb-6 hide-scrollbar" style="scrollbar-width: thin;">
          <!-- Slide 1 -->
          <div class="snap-start shrink-0 w-80 md:w-96 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-xl transition-all">
            <div class="aspect-video bg-gradient-to-r from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
              <svg class="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-lg">Real‑time AI Feedback</h3>
              <p class="text-slate-400 text-sm mt-1">Get instant pronunciation scores and detailed suggestions.</p>
            </div>
          </div>
          <!-- Slide 2 -->
          <div class="snap-start shrink-0 w-80 md:w-96 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-xl transition-all">
            <div class="aspect-video bg-gradient-to-r from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <svg class="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-lg">Progress Analytics</h3>
              <p class="text-slate-400 text-sm mt-1">Track your improvement with detailed charts and streaks.</p>
            </div>
          </div>
          <!-- Slide 3 -->
          <div class="snap-start shrink-0 w-80 md:w-96 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-xl transition-all">
            <div class="aspect-video bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <svg class="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-lg">Rich Content Library</h3>
              <p class="text-slate-400 text-sm mt-1">Hundreds of challenges across levels and topics.</p>
            </div>
          </div>
          <!-- Slide 4 (video placeholder) -->
          <div class="snap-start shrink-0 w-80 md:w-96 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-xl transition-all">
            <div class="aspect-video bg-gradient-to-r from-rose-500/20 to-pink-500/20 flex items-center justify-center">
              <svg class="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="p-5">
              <h3 class="font-bold text-lg">Video Lessons</h3>
              <p class="text-slate-400 text-sm mt-1">Watch native speakers and perfect your accent.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== FILTERS SECTION ========== -->
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex flex-wrap gap-3 items-center bg-white/[0.02] backdrop-blur-sm border border-white/5 rounded-2xl p-4">
          <div class="relative flex-1 min-w-[200px] max-w-xs">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch()"
              type="text"
              placeholder="Search challenges…"
              class="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition"
            />
          </div>

          <select
            [(ngModel)]="selectedNiveau"
            (ngModelChange)="applyFilters()"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60 transition cursor-pointer"
          >
            <option value="">All Levels</option>
            <option *ngFor="let n of niveaux" [value]="n">{{ n }}</option>
          </select>

          <select
            [(ngModel)]="selectedType"
            (ngModelChange)="applyFilters()"
            class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60 transition cursor-pointer"
          >
            <option value="">All Types</option>
            <option *ngFor="let t of types" [value]="t">{{ t }}</option>
          </select>

          <button
            (click)="loadRandom()"
            class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-sm font-semibold transition shadow-lg shadow-violet-600/20"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Random
          </button>
        </div>
      </div>

      <!-- ========== LOADING & ERROR ========== -->
      <div *ngIf="loading()" class="flex justify-center items-center py-24">
        <div class="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div *ngIf="error()" class="max-w-7xl mx-auto px-6 py-6">
        <div class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 backdrop-blur-sm">
          {{ error() }}
        </div>
      </div>

      <!-- ========== REDESIGNED CHALLENGE GRID ========== -->
      <div *ngIf="!loading()" class="max-w-7xl mx-auto px-6 pb-20">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            *ngFor="let c of filteredChallenges()"
            [routerLink]="['/student/challenges', c.id]"
            class="group relative bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Decorative gradient top -->
            <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            
            <!-- Card content -->
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <div class="flex gap-2">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold tracking-wider {{ c.niveau | levelColor }}">
                    {{ c.niveau }}
                  </span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-medium capitalize">
                    {{ c.type }}
                  </span>
                </div>
                <div class="text-xs text-slate-500 flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                  </svg>
                  {{ c.totalSubmissions }}
                </div>
              </div>
              <p class="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition line-clamp-2 leading-snug">
                "{{ c.phrase }}"
              </p>
              <p *ngIf="c.phoneticTranscription" class="text-xs text-slate-500 font-mono mb-3 truncate">
                {{ c.phoneticTranscription }}
              </p>
              <p *ngIf="c.description" class="text-sm text-slate-400 mb-4 line-clamp-2">{{ c.description }}</p>
              <div class="flex items-center justify-between pt-3 border-t border-white/10">
                <div class="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  {{ c.averageScore | number:'1.0-0' }}%
                </div>
                <span class="text-xs px-2 py-0.5 rounded-md"
                  [class]="c.difficulty === 'EASY' ? 'bg-emerald-500/15 text-emerald-400' :
                           c.difficulty === 'MEDIUM' ? 'bg-yellow-500/15 text-yellow-400' :
                           'bg-red-500/15 text-red-400'">
                  {{ c.difficulty }}
                </span>
              </div>
            </div>
          </a>
        </div>

        <!-- Empty state -->
        <div *ngIf="filteredChallenges().length === 0 && !loading()" class="text-center py-24 text-slate-500">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-lg">No challenges found. Try adjusting your filters.</p>
        </div>
      </div>

      <!-- ========== FOOTER ========== -->
      <footer class="border-t border-white/5 py-8 text-center text-slate-500 text-sm">
        <div class="max-w-7xl mx-auto px-6">
          SkillForge — Master pronunciation with AI feedback
        </div>
      </footer>
    </div>

    <style>
      .hide-scrollbar::-webkit-scrollbar {
        height: 4px;
      }
      .hide-scrollbar::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 10px;
      }
      .hide-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(139,92,246,0.5);
        border-radius: 10px;
      }
    </style>
  `,
})
export class ChallengeListComponent implements OnInit {
  // ... (exact same logic as before)
  challenges = signal<PronunciationChallenge[]>([]);
  filteredChallenges = signal<PronunciationChallenge[]>([]);
  loading = signal(false);
  error = signal('');

  searchQuery = '';
  selectedNiveau = '';
  selectedType = '';

  niveaux: NiveauCECRL[] = ['A1','A2','B1','B2','C1','C2'];
  types: ChallengeType[] = ['MOT','PHRASE','DIALOGUE','PARAGRAPH'];

  constructor(private svc: PronunciationService) {}

  ngOnInit() {
    this.loadChallenges();
  }

  loadChallenges() {
    this.loading.set(true);
    this.error.set('');
    this.svc.getActiveChallenges().subscribe({
      next: (data) => {
        this.challenges.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load challenges. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let result = this.challenges();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.phrase.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.keywords?.some(k => k.toLowerCase().includes(q))
      );
    }
    if (this.selectedNiveau) {
      result = result.filter(c => c.niveau === this.selectedNiveau);
    }
    if (this.selectedType) {
      result = result.filter(c => c.type === this.selectedType);
    }
    this.filteredChallenges.set(result);
  }

  loadRandom() {
    const niveau = this.selectedNiveau as NiveauCECRL | undefined;
    this.svc.getRandomChallenge(niveau || undefined).subscribe({
      next: (c) => {
        this.filteredChallenges.set([c]);
      },
      error: () => this.error.set('No random challenge found.'),
    });
  }
}