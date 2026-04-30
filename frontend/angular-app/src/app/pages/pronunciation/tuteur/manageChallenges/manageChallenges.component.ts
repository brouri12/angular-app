import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LevelColorPipe } from '../../../../../pipes/Pronunciation.pipes';
import { NiveauCECRL, ChallengeType, DifficultyLevel, PronunciationChallenge } from '../../../../../shared/models/pronunciation.types';
import { PronunciationService } from '../../../../services/pronunciation.service';


const NIVEAUX: NiveauCECRL[] = ['A1','A2','B1','B2','C1','C2'];
const TYPES: ChallengeType[] = ['MOT','PHRASE','DIALOGUE','PARAGRAPH'];
const DIFFICULTIES: DifficultyLevel[] = ['EASY','MEDIUM','HARD'];

@Component({
  selector: 'app-manage-challenges',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LevelColorPipe],
  template: `
    <div class="min-h-screen bg-[#0a0a14] text-white font-['Syne',sans-serif]">

      <!-- Header -->
      <div class="relative overflow-hidden border-b border-white/5 pb-10 pt-14 px-6">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-transparent to-orange-900/15 pointer-events-none"></div>
        <div class="relative max-w-6xl mx-auto flex items-end justify-between flex-wrap gap-4">
          <div>
            <p class="text-xs font-semibold tracking-[0.3em] text-amber-400 uppercase mb-3">Tuteur Dashboard</p>
            <h1 class="text-4xl font-black">
              Manage <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Challenges</span>
            </h1>
          </div>
          <div class="flex gap-3">

            <button (click)="openForm(null)"
                    class="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm font-semibold transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              New Challenge
            </button>
          </div>
        </div>
      </div>

      <!-- ── FORM MODAL ─────────────────────────────────────────────── -->
      <div *ngIf="showForm()" class="fixed inset-0 bg-black/70 flex items-start justify-center z-50 pt-10 px-4 pb-10 overflow-y-auto">
        <div class="bg-[#141420] border border-white/10 rounded-2xl p-8 w-full max-w-2xl">
          <h2 class="text-xl font-bold mb-6">
            {{ editingId() ? 'Edit Challenge' : 'Create Challenge' }}
          </h2>

          <div class="space-y-4">
            <!-- Phrase -->
            <div>
              <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Phrase *</label>
              <textarea [(ngModel)]="form.phrase" rows="2"
                        class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 transition resize-none"
                        placeholder="The quick brown fox..."></textarea>
            </div>

            <!-- Row: Niveau / Type / Difficulty -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Level *</label>
                <select [(ngModel)]="form.niveau"
                        class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 transition">
                  <option *ngFor="let n of niveaux" [value]="n">{{ n }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Type *</label>
                <select [(ngModel)]="form.type"
                        class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 transition">
                  <option *ngFor="let t of types" [value]="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Difficulty</label>
                <select [(ngModel)]="form.difficulty"
                        class="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 transition">
                  <option *ngFor="let d of difficulties" [value]="d">{{ d }}</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Description</label>
              <input [(ngModel)]="form.description" type="text"
                     class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 transition"
                     placeholder="Usage context…" />
            </div>

            <!-- Phonetic -->
            <div>
              <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Phonetic Transcription</label>
              <input [(ngModel)]="form.phoneticTranscription" type="text"
                     class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500/60 transition"
                     placeholder="/ðə ˈkwɪk brɑʊn fɒks/" />
            </div>

            <!-- Tips -->
            <div>
              <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Pronunciation Tips</label>
              <textarea [(ngModel)]="form.tips" rows="2"
                        class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/60 transition resize-none"
                        placeholder="Focus on the 'th' sound at the start…"></textarea>
            </div>

            <!-- Audio Ref URL -->
            <div>
              <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Reference Audio URL</label>
              <input [(ngModel)]="form.audioReferenceUrl" type="url"
                     class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 transition"
                     placeholder="https://…" />
            </div>

            <!-- Keywords -->
            <div>
              <label class="text-xs text-slate-400 mb-1 block uppercase tracking-wider">Keywords (comma-separated)</label>
              <input [(ngModel)]="keywordsInput" type="text"
                     class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60 transition"
                     placeholder="th, consonant, voiced" />
            </div>

            <!-- Active toggle -->
            <div class="flex items-center gap-3">
              <button (click)="form.actif = !form.actif"
                      class="relative w-10 h-5 rounded-full transition-colors"
                      [class]="form.actif ? 'bg-amber-500' : 'bg-white/10'">
                <span class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                      [class]="form.actif ? 'left-5' : 'left-0.5'"></span>
              </button>
              <span class="text-sm text-slate-400">Active (visible to students)</span>
            </div>

            <!-- Error -->
            <div *ngIf="formError()" class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
              {{ formError() }}
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button (click)="saveChallenge()" [disabled]="saving()"
                    class="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-xl font-semibold transition flex items-center justify-center gap-2">
              <span *ngIf="saving()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {{ saving() ? 'Saving…' : (editingId() ? 'Update Challenge' : 'Create Challenge') }}
            </button>
            <button (click)="closeForm()"
                    class="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- ── TABLE ──────────────────────────────────────────────────── -->
      <div *ngIf="loading()" class="flex justify-center py-24">
        <div class="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Delete confirm -->
      <div *ngIf="confirmDeleteId()" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div class="bg-[#141420] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4">
          <h3 class="text-lg font-bold mb-2">Deactivate Challenge?</h3>
          <p class="text-slate-400 text-sm mb-6">The challenge will be hidden from students.</p>
          <div class="flex gap-3">
            <button (click)="confirmDelete()" class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl font-semibold text-sm transition">Confirm</button>
            <button (click)="confirmDeleteId.set(null)" class="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl font-semibold text-sm transition">Cancel</button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading()" class="max-w-6xl mx-auto px-6 pb-16">
        <!-- Search -->
        <div class="py-5">
          <div class="relative max-w-xs">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input [(ngModel)]="search" (ngModelChange)="applySearch()" type="text"
                   placeholder="Search…"
                   class="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition" />
          </div>
        </div>

        <!-- Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div *ngFor="let c of filteredChallenges()"
               class="bg-white/[0.03] border rounded-2xl p-5 transition"
               [class]="c.actif ? 'border-white/8 hover:border-amber-500/20' : 'border-white/4 opacity-50'">
            <!-- Top -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-lg border text-xs font-bold {{ c.niveau | levelColor }}">
                  {{ c.niveau }}
                </span>
                <span class="text-xs text-slate-500">{{ c.type }}</span>
              </div>
              <span class="text-xs px-2 py-0.5 rounded-md"
                    [class]="c.actif ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-500/15 text-slate-400'">
                {{ c.actif ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <p class="font-bold text-white mb-1 line-clamp-2">"{{ c.phrase }}"</p>
            <p *ngIf="c.phoneticTranscription" class="text-xs font-mono text-slate-500 mb-3">{{ c.phoneticTranscription }}</p>

            <!-- Stats -->
            <div class="flex gap-4 text-xs text-slate-500 mb-4 py-3 border-t border-b border-white/5">
              <span>{{ c.totalSubmissions }} attempts</span>
              <span>avg {{ c.averageScore | number:'1.0-0' }}%</span>
              <span class="capitalize">{{ c.difficulty }}</span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <a [routerLink]="['/tuteur/results', c.id]"
                 class="flex-1 py-2 text-center text-xs font-semibold bg-white/5 hover:bg-white/10 rounded-lg transition">
                View Results
              </a>
              <button (click)="openForm(c)"
                      class="p-2 bg-amber-600/20 hover:bg-amber-600/40 rounded-lg text-amber-300 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button (click)="confirmDeleteId.set(c.id)"
                      class="p-2 bg-red-600/10 hover:bg-red-600/30 rounded-lg text-red-400 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div *ngIf="filteredChallenges().length === 0 && !loading()" class="text-center py-20 text-slate-500">
          <p>No challenges yet. Create your first one!</p>
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
export class ManageChallengesComponent implements OnInit {
  allChallenges = signal<PronunciationChallenge[]>([]);
  filteredChallenges = signal<PronunciationChallenge[]>([]);
  loading = signal(true);
  saving = signal(false);
  seeding = signal(false);
  totalPages = signal(0);
  currentPage = signal(0);

  showForm = signal(false);
  editingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);
  formError = signal('');
  search = '';

  niveaux = NIVEAUX;
  types = TYPES;
  difficulties = DIFFICULTIES;
  keywordsInput = '';

  form: Partial<PronunciationChallenge> = this.emptyForm();

  constructor(private svc: PronunciationService) {}

  ngOnInit() { this.loadChallenges(0); }

  loadChallenges(page: number) {
    this.loading.set(true);
    this.svc.getChallenges(page, 50).subscribe({
      next: (p) => {
        this.allChallenges.set(p.content);
        this.applySearch();
        this.totalPages.set(p.totalPages);
        this.currentPage.set(p.number);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applySearch() {
    const q = this.search.toLowerCase();
    if (!q) { this.filteredChallenges.set(this.allChallenges()); return; }
    this.filteredChallenges.set(
      this.allChallenges().filter(c =>
        c.phrase.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      )
    );
  }

  changePage(p: number) { this.loadChallenges(p); }

  openForm(challenge: PronunciationChallenge | null) {
    if (challenge) {
      this.editingId.set(challenge.id);
      this.form = { ...challenge };
      this.keywordsInput = challenge.keywords?.join(', ') ?? '';
    } else {
      this.editingId.set(null);
      this.form = this.emptyForm();
      this.keywordsInput = '';
    }
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  saveChallenge() {
    if (!this.form.phrase?.trim()) {
      this.formError.set('Phrase is required.');
      return;
    }
    this.form.keywords = this.keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
    this.saving.set(true);
    this.formError.set('');

    const obs = this.editingId()
      ? this.svc.updateChallenge(this.editingId()!, this.form)
      : this.svc.createChallenge(this.form);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadChallenges(this.currentPage());
      },
      error: () => {
        this.formError.set('Save failed. Please check your input.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete() {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.svc.deleteChallenge(id).subscribe({
      next: () => {
        this.confirmDeleteId.set(null);
        this.loadChallenges(this.currentPage());
      },
    });
  }

  seedChallenges() {
    this.seeding.set(true);
    this.svc.seedDefaultChallenges().subscribe({
      next: () => { this.seeding.set(false); this.loadChallenges(0); },
      error: () => this.seeding.set(false),
    });
  }

  emptyForm(): Partial<PronunciationChallenge> {
    return { phrase: '', niveau: 'A1', type: 'MOT', difficulty: 'MEDIUM', actif: true, description: '', tips: '' };
  }
}