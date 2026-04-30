import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScoreColorPipe, StatusColorPipe, LevelColorPipe } from '../../../../../pipes/Pronunciation.pipes';
import { PronunciationChallenge, UserRecording } from '../../../../../shared/models/pronunciation.types';
import { PronunciationService } from '../../../../services/pronunciation.service';

@Component({
  selector: 'app-student-results',
  standalone: true,
imports: [CommonModule, RouterModule, FormsModule, ScoreColorPipe, StatusColorPipe],
  template: `
    <div class="min-h-screen bg-[#0a0a14] text-white font-['Syne',sans-serif]">

      <!-- Header -->
      <div class="relative overflow-hidden border-b border-white/5 pb-10 pt-14 px-6">
        <div class="absolute inset-0 bg-gradient-to-br from-teal-900/15 via-transparent to-cyan-900/15 pointer-events-none"></div>
        <div class="relative max-w-6xl mx-auto">
          <div class="flex items-center gap-3 mb-4">
            <a routerLink="/tuteur/challenges"
               class="text-sm text-slate-400 hover:text-white transition flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Challenges
            </a>
            <span class="text-slate-700">/</span>
            <span class="text-sm text-slate-400">Student Results</span>
          </div>
          <p class="text-xs font-semibold tracking-[0.3em] text-teal-400 uppercase mb-3">Analytics</p>
          <h1 class="text-4xl font-black">
            Student <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Recordings</span>
          </h1>
          <p *ngIf="challenge()" class="text-slate-400 mt-2 max-w-2xl">
            Challenge: <span class="text-white font-semibold">"{{ challenge()!.phrase }}"</span>
          </p>
        </div>
      </div>

      <!-- Stats summary -->
      <div *ngIf="recordings().length > 0" class="max-w-6xl mx-auto px-6 py-6">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-center">
            <p class="text-2xl font-black text-teal-400">{{ totalElements() }}</p>
            <p class="text-xs text-slate-500 mt-1">Total Recordings</p>
          </div>
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-center">
            <p class="text-2xl font-black" [class]="computeAvg('overallScore') | scoreColor">
              {{ computeAvg('overallScore') | number:'1.0-0' }}%
            </p>
            <p class="text-xs text-slate-500 mt-1">Avg Overall</p>
          </div>
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-center">
            <p class="text-2xl font-black" [class]="computeAvg('pronunciationScore') | scoreColor">
              {{ computeAvg('pronunciationScore') | number:'1.0-0' }}%
            </p>
            <p class="text-xs text-slate-500 mt-1">Avg Pronun.</p>
          </div>
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-center">
            <p class="text-2xl font-black" [class]="computeAvg('fluencyScore') | scoreColor">
              {{ computeAvg('fluencyScore') | number:'1.0-0' }}%
            </p>
            <p class="text-xs text-slate-500 mt-1">Avg Fluency</p>
          </div>
          <div class="bg-white/[0.03] border border-white/8 rounded-xl p-4 text-center">
            <p class="text-2xl font-black text-yellow-400">{{ pendingCount() }}</p>
            <p class="text-xs text-slate-500 mt-1">Pending Eval.</p>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-20">
        <div class="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Detail Modal -->
  <div *ngIf="expandedRecording()" class="fixed inset-0 bg-black/70 flex items-start justify-center z-50 pt-12 px-4 pb-10 overflow-y-auto">
        <div class="bg-[#141420] border border-white/10 rounded-2xl p-8 w-full max-w-2xl">
          <div class="flex items-start justify-between mb-6">
            <div>
              <p class="text-xs text-slate-500 mb-1">Student ID: {{ expandedRecording()!.userId }}</p>
              <h3 class="text-xl font-bold">"{{ expandedRecording()!.challengePhrase }}"</h3>
              <p class="text-xs text-slate-500 mt-1">
                Submitted: {{ expandedRecording()!.submittedAt | date:'medium' }} •
                Attempt #{{ expandedRecording()!.attemptNumber }}
              </p>
            </div>
            <button (click)="expandedRecording.set(null)"
                    class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Status -->
          <div class="mb-5 flex items-center gap-3">
            <span class="text-xs px-2 py-1 rounded-lg {{ expandedRecording()!.status | statusColor }}">
              {{ expandedRecording()!.status }}
            </span>
          </div>

          <!-- Score grid -->
          <div class="grid grid-cols-5 gap-3 mb-6">
            <div *ngFor="let s of getScoreItems(expandedRecording()!)" class="text-center bg-black/30 rounded-xl py-3">
              <p class="text-lg font-black" [class]="s.value | scoreColor">{{ s.value | number:'1.0-0' }}</p>
              <p class="text-xs text-slate-500">{{ s.label }}</p>
            </div>
          </div>

          <!-- Audio player - FIXED -->
          <div class="mb-5">
            <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Student Recording</p>
            <audio 
              controls 
              [src]="getAudioUrl(expandedRecording()!.audioUrl)" 
              class="w-full accent-teal-500 rounded-lg">
            </audio>
          </div>

          <!-- AI Feedback -->
          <div *ngIf="expandedRecording()!.aiFeedback"
               class="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-5 py-4 mb-4">
            <p class="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">AI Feedback</p>
            <p class="text-slate-300 text-sm leading-relaxed">{{ expandedRecording()!.aiFeedback }}</p>
          </div>

          <!-- Problematic phonemes -->
          <div *ngIf="expandedRecording()!.problematicPhonemes?.length" class="mb-4">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Problematic Phonemes</p>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let p of expandedRecording()!.problematicPhonemes"
                    class="px-3 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-mono rounded-lg">
                {{ p }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div *ngIf="!loading()" class="max-w-6xl mx-auto px-6 pb-16">

        <!-- Filter bar -->
        <div class="py-5 flex flex-wrap gap-3 items-center">
          <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()"
                  class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500/60 transition">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="EVALUATED">Evaluated</option>
            <option value="FAILED">Failed</option>
          </select>
          <input [(ngModel)]="userIdFilter" (ngModelChange)="applyFilters()" type="number"
                 placeholder="Filter by User ID…"
                 class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60 transition w-44" />
        </div>

        <!-- Recordings list -->
        <div class="space-y-3">
          <div *ngFor="let r of filteredRecordings()"
               class="bg-white/[0.03] border border-white/8 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4 hover:border-teal-500/20 transition">

            <!-- User + meta -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <div class="w-7 h-7 rounded-full bg-teal-600/30 flex items-center justify-center text-xs font-bold text-teal-300">
                  {{ r.userId }}
                </div>
                <span class="text-xs text-slate-500">Student #{{ r.userId }}</span>
                <span class="text-xs px-2 py-0.5 rounded {{ r.status | statusColor }}">{{ r.status }}</span>
                <span class="text-xs text-slate-600">attempt #{{ r.attemptNumber }}</span>
              </div>
              <p class="text-sm text-slate-400 truncate">{{ r.submittedAt | date:'medium' }}</p>
            </div>

            <!-- Scores -->
            <div class="flex items-center gap-3">
              <div *ngFor="let s of getScoreItems(r)" class="text-center hidden lg:block">
                <p class="text-sm font-bold" [class]="s.value | scoreColor">{{ s.value | number:'1.0-0' }}</p>
                <p class="text-xs text-slate-600">{{ s.label }}</p>
              </div>
              <!-- Compact on mobile -->
              <div class="lg:hidden">
                <p class="text-xl font-black" [class]="r.overallScore | scoreColor">{{ r.overallScore | number:'1.0-0' }}%</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button (click)="expandedRecording.set(r)"
                      class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition" title="View Details">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              <button (click)="deleteRecording(r.id)"
                      class="p-2 rounded-lg bg-red-600/10 hover:bg-red-600/30 transition text-red-400" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="filteredRecordings().length === 0 && !loading()" class="text-center py-20 text-slate-500">
          <p>No recordings found for this challenge.</p>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-2 mt-8">
          <button (click)="changePage(currentPage() - 1)" [disabled]="currentPage() === 0"
                  class="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm transition">Prev</button>
          <span class="text-sm text-slate-500">{{ currentPage() + 1 }} / {{ totalPages() }}</span>
          <button (click)="changePage(currentPage() + 1)" [disabled]="currentPage() >= totalPages() - 1"
                  class="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm transition">Next</button>
        </div>
      </div>
    </div>
  `,
})
export class StudentResultsComponent implements OnInit {
  challenge = signal<PronunciationChallenge | null>(null);
  recordings = signal<UserRecording[]>([]);
  filteredRecordings = signal<UserRecording[]>([]);
  loading = signal(true);
  totalElements = signal(0);
  totalPages = signal(0);
  currentPage = signal(0);
  expandedRecording = signal<UserRecording | null>(null);

  statusFilter = '';
  userIdFilter: number | null = null;

  private challengeId!: number;

  constructor(
    private route: ActivatedRoute, 
    private svc: PronunciationService
  ) {}

  ngOnInit() {
    this.challengeId = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getChallengeById(this.challengeId).subscribe({
      next: (c) => this.challenge.set(c),
    });
    this.loadRecordings(0);
  }

  loadRecordings(page: number) {
    this.loading.set(true);
    this.svc.getChallengeRecordings(this.challengeId, page, 20).subscribe({
      next: (p) => {
        this.recordings.set(p.content);
        this.applyFilters();
        this.totalElements.set(p.totalElements);
        this.totalPages.set(p.totalPages);
        this.currentPage.set(p.number);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // NEW HELPER METHOD - CLEAN & RELIABLE
  getAudioUrl(audioUrl: string | null | undefined): string {
    if (!audioUrl) return '';
    
    // If audioUrl already starts with http/https, use it as is
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }
    
    // Otherwise, make sure it starts with / and prepend base URL
    const cleanUrl = audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl;
    return this.svc.getAudioFileUrl(cleanUrl.replace('/api/pronunciation/audio/', '')); 
    // Better: since we already store full relative path, we can do:
    // return `${environment.apiUrl}${cleanUrl}`;
  }

  applyFilters() {
    let r = this.recordings();
    if (this.statusFilter) r = r.filter(x => x.status === this.statusFilter);
    if (this.userIdFilter) r = r.filter(x => x.userId === this.userIdFilter);
    this.filteredRecordings.set(r);
  }

  changePage(p: number) { this.loadRecordings(p); }

  deleteRecording(id: number) {
    this.svc.deleteRecording(id).subscribe({
      next: () => this.loadRecordings(this.currentPage()),
    });
  }

  getScoreItems(r: UserRecording) {
    return [
      { label: 'Overall', value: r.overallScore },
      { label: 'Pronun.', value: r.pronunciationScore },
      { label: 'Fluency', value: r.fluencyScore },
      { label: 'Intona.', value: r.intonationScore },
      { label: 'Clarity', value: r.clarityScore },
    ];
  }

  computeAvg(field: keyof UserRecording): number {
    const r = this.recordings();
    if (!r.length) return 0;
    return r.reduce((a, b) => a + (b[field] as number), 0) / r.length;
  }

  pendingCount(): number {
    return this.recordings().filter(r => r.status === 'PENDING').length;
  }
}