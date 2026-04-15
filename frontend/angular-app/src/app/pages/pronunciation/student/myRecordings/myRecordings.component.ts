import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScoreColorPipe, StatusColorPipe } from '../../../../../pipes/Pronunciation.pipes';
import { UserRecording } from '../../../../../shared/models/pronunciation.types';
import { PronunciationService } from '../../../../services/pronunciation.service';
import { environment } from '../../../../../environments/environment';

interface CollectionItem {
  type: string;
  label: string;
  color: string;
}

interface ScoreItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-my-recordings',
  standalone: true,
  imports: [CommonModule, RouterModule, ScoreColorPipe, StatusColorPipe],
  template: `
    <div class="min-h-screen bg-[#0a0a14] text-white font-['Syne',sans-serif]">

      <!-- Collections Tabs -->
      <div class="sticky top-[68px] z-10 bg-[#0a0a14]/95 backdrop-blur-md border-b border-white/5 px-6 py-3">
        <div class="max-w-5xl mx-auto">
          <nav class="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              *ngFor="let c of collections"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all relative group"
              [class]="c.type === selectedCollection() ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25' : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'"
              (click)="selectedCollection.set(c.type); currentPage.set(0); loadRecordings(0)">
              <span [class]="c.color">{{ c.label }}</span>
              <span class="ml-auto text-xs opacity-75">{{ collectionCounts[c.type] }}</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Header -->
      <div class="relative overflow-hidden border-b border-white/5 pb-10 pt-14 px-6">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-violet-900/20 pointer-events-none"></div>
        <div class="relative max-w-5xl mx-auto flex items-end justify-between flex-wrap gap-4">
          <div>
            <p class="text-xs font-semibold tracking-[0.3em] text-indigo-400 uppercase mb-3">My Progress</p>
            <h1 class="text-4xl font-black tracking-tight">
              My <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Recordings</span>
            </h1>
          </div>
          <a routerLink="/student/challenges"
             class="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Challenge
          </a>
        </div>
      </div>

      <!-- Summary -->
      <div *ngIf="recordings().length > 0" class="max-w-5xl mx-auto px-6 py-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-5 text-center">
            <p class="text-3xl font-black text-violet-400">{{ totalElements() }}</p>
            <p class="text-xs text-slate-500 mt-1">Total Recordings</p>
          </div>
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-5 text-center">
            <p class="text-3xl font-black" [class]="avgScore() | scoreColor">{{ avgScore() | number:'1.0-0' }}%</p>
            <p class="text-xs text-slate-500 mt-1">Avg Score</p>
          </div>
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-5 text-center">
            <p class="text-3xl font-black text-emerald-400">{{ evaluatedCount() }}</p>
            <p class="text-xs text-slate-500 mt-1">Evaluated</p>
          </div>
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-5 text-center">
            <p class="text-3xl font-black text-yellow-400">{{ pendingCount() }}</p>
            <p class="text-xs text-slate-500 mt-1">Pending</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-20">
        <div class="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Recordings Table -->
      <div *ngIf="!loading()" class="max-w-5xl mx-auto px-6 pb-16">

        <!-- Delete confirm -->
        <div *ngIf="confirmDeleteId()" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div class="bg-[#141420] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold mb-2">Delete Recording?</h3>
            <p class="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div class="flex gap-3">
              <button (click)="confirmDelete()"
                      class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl font-semibold text-sm transition">
                Delete
              </button>
              <button (click)="confirmDeleteId.set(null)"
                      class="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Recordings list -->
        <div class="space-y-3">
          <!-- VIEW DETAILS MODAL -->
          <div *ngIf="expandedRecording() as recording" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 md:p-8">
            <div class="bg-[#1a1a2e] border border-white/20 rounded-3xl max-w-lg md:max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
              <!-- Header -->
              <div class="sticky top-0 bg-[#1a1a2e]/95 backdrop-blur p-6 border-b border-white/10 rounded-t-3xl">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold">Recording Details</h3>
                  <button (click)="closeModal()" class="p-2 -m-2 hover:bg-white/10 rounded-xl transition-all">
                    <svg class="w-5 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Content -->
              <div class="p-6 space-y-6">
                <!-- Audio Player -->
                <audio [src]="getAudioUrl(recording.audioUrl)" controls class="w-full rounded-xl bg-black/30 h-16">
                  Your browser does not support the audio element.
                </audio>
                <!-- Challenge Phrase -->
                <div>
                  <p class="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Challenge</p>
                  <p class="text-lg md:text-xl font-bold text-white leading-tight">"{{ recording.challengePhrase }}"</p>
                </div>
                <!-- Scores Grid -->
                <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div *ngFor="let s of getScoreItems(recording)" class="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <p class="text-lg font-black mb-1" [class]="s.value | scoreColor">{{ s.value | number:'1.0-0' }}%</p>
                    <p class="text-xs uppercase tracking-wide text-slate-400">{{ s.label }}</p>
                  </div>
                </div>
                <!-- Status -->
                <div class="flex items-center gap-3 pt-4 border-t border-white/10">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold" [class]="recording.status | statusColor">
                    {{ recording.status }}
                  </span>
                  <span class="text-sm text-slate-400">{{ recording.submittedAt | date:'MMM d, y • h:mm a' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recordings cards -->
          <div *ngFor="let r of recordings()"
               class="bg-white/[0.03] border border-white/8 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-violet-500/20 transition-all duration-200 hover:shadow-xl">
            <!-- Phrase -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="r.status | statusColor">{{ r.status }}</span>
                <span class="text-xs text-slate-500">attempt #{{ r.attemptNumber }}</span>
              </div>
              <p class="font-semibold text-white leading-tight line-clamp-2">"{{ r.challengePhrase }}"</p>
              <p class="text-xs text-slate-400 mt-1">{{ r.submittedAt | date:'mediumDate' }}</p>
            </div>

            <!-- Scores -->
            <div class="flex items-center gap-4 flex-shrink-0">
              <div *ngFor="let s of getScoreItems(r)" class="text-center hidden md:block">
                <p class="text-sm font-bold" [class]="s.value | scoreColor">{{ s.value | number:'1.0-0' }}%</p>
                <p class="text-xs uppercase tracking-wide text-slate-500">{{ s.label }}</p>
              </div>
              <div class="md:hidden text-center">
                <p class="text-2xl font-black" [class]="r.overallScore | scoreColor">
                  {{ r.overallScore | number:'1.0-0' }}%
                </p>
                <p class="text-xs uppercase tracking-wide text-slate-500">Overall</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button (click)="expandedRecording.set(r)" 
                      class="p-2.5 rounded-lg bg-gradient-to-r from-violet-500/20 to-indigo-500/20 hover:from-violet-500/40 hover:to-indigo-500/40 border border-white/20 transition-all duration-200 text-white shadow-md hover:shadow-lg" 
                      title="View Details">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
              <a [routerLink]="['/student/challenges', r.challengeId]" 
                 class="p-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 transition-all duration-200 text-emerald-300 border border-white/20" 
                 title="Re-record">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </a>
              <button (click)="confirmDeleteId.set(r.id)" 
                      class="p-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-all duration-200 text-red-300 border border-white/20" 
                      title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="recordings().length === 0 && !loading()" class="text-center py-24 text-slate-500">
          <svg class="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/>
          </svg>
          <h3 class="text-2xl font-bold text-white mb-3">No recordings yet</h3>
          <p class="text-slate-400 mb-6">Get started by recording your first pronunciation challenge.</p>
          <a routerLink="/student/challenges" class="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl">
            Start Challenge
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H7"/>
            </svg>
          </a>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-2 mt-12">
          <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 0"
                  class="px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all border border-white/10">
            Previous
          </button>
          <span class="px-4 py-2 text-sm text-slate-400 font-medium">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
          <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() === totalPages() - 1"
                  class="px-4 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all border border-white/10">
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MyRecordingsComponent implements OnInit {
  recordings = signal<UserRecording[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);

  confirmDeleteId = signal<number | null>(null);
  expandedRecording = signal<UserRecording | null>(null);

  collections: CollectionItem[] = [
    { type: 'ALL', label: 'All', color: 'text-slate-400' },
    { type: 'PERFECT', label: 'Perfect', color: 'text-emerald-400' },
    { type: 'EXCELLENT', label: 'Excellent', color: 'text-yellow-400' },
    { type: 'GOOD', label: 'Good', color: 'text-blue-400' },
    { type: 'PRACTICE', label: 'Practice', color: 'text-orange-400' },
{ type: 'STREAK_MASTER', label: 'Streak', color: 'text-purple-400' },
  ];

  selectedCollection = signal('ALL');

  collectionCounts: { [key: string]: number } = {
    ALL: 0, PERFECT: 0, EXCELLENT: 0, GOOD: 0, PRACTICE: 0, STREAK: 0
  };

  readonly userId = 1;  // test-student

  constructor(private svc: PronunciationService) {}

  ngOnInit() { 
    // 1. Load ALL page 0 → COUNTS GLOBAUX
    this.svc.getUserRecordings(this.userId, 0, 100, undefined).subscribe({
      next: (p) => {
        const allRecs = p.content;
        this.totalElements.set(p.totalElements);
        
        // COUNTS sur TOUS (100 recs max)
        this.collectionCounts = {
          ALL: p.totalElements,
          PERFECT: allRecs.filter(r => r.overallScore && r.overallScore >= 90).length,
          EXCELLENT: allRecs.filter(r => r.overallScore && r.overallScore >= 80 && r.overallScore < 90).length,
          GOOD: allRecs.filter(r => r.overallScore && r.overallScore >= 70 && r.overallScore < 80).length,
          PRACTICE: allRecs.filter(r => r.overallScore && r.overallScore < 70).length,
          STREAK_MASTER: allRecs.filter(r => r.overallScore && r.overallScore === 99).length
        };
        
        // 2. Load collection 'ALL' page 0
        this.loadRecordings(0);
      }
    });
  }

  loadRecordings(page: number) {
    this.loading.set(true);
    const collection = this.selectedCollection();
    this.svc.getUserRecordings(this.userId, page, 10, collection === 'ALL' ? undefined : (collection as any)).subscribe({
      next: (p) => {
        this.recordings.set(p.content);
        this.totalElements.set(p.totalElements);
        this.totalPages.set(p.totalPages);
        this.currentPage.set(p.number);
        // NO updateCollectionCounts() → Garde backend counts globaux
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateCollectionCounts() {
    const recs = this.recordings();
    this.collectionCounts = {
      ALL: recs.length,
      PERFECT: recs.filter(r => r.overallScore && r.overallScore >= 90).length,
      EXCELLENT: recs.filter(r => r.overallScore && r.overallScore >= 80 && r.overallScore < 90).length,
      GOOD: recs.filter(r => r.overallScore && r.overallScore >= 70 && r.overallScore < 80).length,
      PRACTICE: recs.filter(r => r.overallScore && r.overallScore < 70).length,
STREAK: recs.filter(r => r.overallScore && r.overallScore === 99).length  // UNIQUEMENT 99.0 exact
    };
  }

  changePage(p: number) { 
    if (p >= 0 && p < this.totalPages()) {
      this.loadRecordings(p); 
    }
  }

  confirmDelete() {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.svc.deleteRecording(id).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.loadRecordings(this.currentPage());
      },
    });
  }

  getScoreItems(r: UserRecording) {
    return [
      { label: 'Overall', value: r.overallScore || 0 },
      { label: 'Pronun.', value: r.pronunciationScore || 0 },
      { label: 'Fluency', value: r.fluencyScore || 0 },
      { label: 'Intona.', value: r.intonationScore || 0 },
      { label: 'Clarity', value: r.clarityScore || 0 },
    ];
  }

  avgScore(): number {
    const r = this.recordings();
    if (!r.length) return 0;
    return r.reduce((a, b) => a + (b.overallScore || 0), 0) / r.length;
  }

  evaluatedCount(): number {
    return this.recordings().filter(r => r.status === 'COMPLETED').length;
  }

  pendingCount(): number {
    return this.recordings().filter(r => r.status === 'PROCESSING').length;
  }

  getAudioUrl(audioUrl: string | null | undefined): string {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http')) return audioUrl;
    
    const cleanPath = audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl;
    return `${environment.apiUrl || 'http://localhost:8081'}${cleanPath}`;
  }

  closeModal() {
    this.expandedRecording.set(null);
  }
}
