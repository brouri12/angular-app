import {
  Component, OnInit, OnDestroy, signal, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LevelColorPipe, ScoreColorPipe, StatusColorPipe } from '../../../../../pipes/Pronunciation.pipes';
import { PronunciationChallenge, UserRecording } from '../../../../../shared/models/pronunciation.types';
import { PronunciationService } from '../../../../services/pronunciation.service';

const MOCK_USER_ID = 1;

@Component({
  selector: 'app-challenge-detail',
  standalone: true,
imports: [CommonModule, RouterModule, LevelColorPipe, ScoreColorPipe, StatusColorPipe],
  template: `
    <div class="min-h-screen bg-[#0a0a14] text-white font-['Syne',sans-serif]">

      <!-- Back -->
      <div class="max-w-4xl mx-auto px-6 pt-10 pb-4">
        <a routerLink="/student/challenges"
           class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to challenges
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-24">
        <div class="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <ng-container *ngIf="challenge() as c">
        <div class="max-w-4xl mx-auto px-6 pb-20">

          <!-- Challenge Card -->
          <div class="bg-white/[0.03] border border-white/8 rounded-2xl p-8 mb-6">
            <div class="flex flex-wrap items-center gap-3 mb-5">
              <span class="inline-flex items-center px-3 py-1 rounded-lg border text-xs font-bold {{ c.niveau | levelColor }}">
                {{ c.niveau }}
              </span>
              <span class="text-xs text-slate-500">{{ c.type }}</span>
              <span class="text-xs px-2 py-0.5 rounded-md"
                [class]="c.difficulty === 'EASY' ? 'bg-emerald-500/15 text-emerald-400' :
                         c.difficulty === 'MEDIUM' ? 'bg-yellow-500/15 text-yellow-400' :
                         'bg-red-500/15 text-red-400'">
                {{ c.difficulty }}
              </span>
            </div>

            <h1 class="text-3xl font-black mb-3 leading-tight">"{{ c.phrase }}"</h1>

            <p *ngIf="c.phoneticTranscription"
               class="text-xl font-mono text-violet-300/70 mb-5">
              {{ c.phoneticTranscription }}
            </p>

            <p *ngIf="c.description" class="text-slate-400 mb-6">{{ c.description }}</p>

            <!-- Tips -->
            <div *ngIf="c.tips" class="bg-violet-500/10 border border-violet-500/20 rounded-xl px-5 py-4 mb-6">
              <div class="flex items-center gap-2 text-violet-300 font-semibold text-sm mb-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Pronunciation Tips
              </div>
              <p class="text-slate-300 text-sm">{{ c.tips }}</p>
            </div>

            <!-- Reference Audio -->
            <div *ngIf="c.audioReferenceUrl" class="mb-6">
              <p class="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-2">Reference Audio</p>
              <audio controls [src]="c.audioReferenceUrl"
                     class="w-full h-10 rounded-lg accent-violet-500"></audio>
            </div>

            <!-- Stats row -->
            <div class="flex gap-6 pt-5 border-t border-white/5">
              <div>
                <p class="text-xs text-slate-500 mb-0.5">Attempts</p>
                <p class="text-xl font-bold">{{ c.totalSubmissions }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 mb-0.5">Avg Score</p>
                <p class="text-xl font-bold" [class]="c.averageScore | scoreColor">
                  {{ c.averageScore | number:'1.0-0' }}%
                </p>
              </div>
            </div>
          </div>

          <!-- ── RECORD SECTION ─────────────────────────────── -->
          <div class="bg-white/[0.03] border border-white/8 rounded-2xl p-8 mb-6">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-black">1</span>
              Record Your Pronunciation
            </h2>

            <!-- Error -->
            <div *ngIf="recordError()"
                 class="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-4 text-sm">
              {{ recordError() }}
            </div>

            <!-- Success -->
            <div *ngIf="submitSuccess()"
                 class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
              <span *ngIf="isPolling()" class="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              {{ isPolling() ? 'AI is evaluating your pronunciation…' : 'Evaluation complete!' }}
            </div>

            <!-- Controls -->
            <div class="flex flex-col items-center gap-5">
              <!-- Waveform visualizer -->
              <div class="w-full h-16 bg-black/30 rounded-xl flex items-center justify-center overflow-hidden relative">
                <div *ngIf="!isRecording()" class="text-slate-600 text-sm">Waveform will appear while recording</div>
                <div *ngIf="isRecording()" class="flex items-end gap-0.5 h-10 px-4 w-full justify-center">
                  <div *ngFor="let b of bars" [style.height.px]="b"
                       class="w-1 bg-violet-500 rounded-full transition-all duration-100 animate-pulse"></div>
                </div>
              </div>

              <!-- Timer -->
              <p *ngIf="isRecording()" class="text-3xl font-mono font-bold text-violet-400 tabular-nums">
                {{ formatTime(recordingSeconds()) }}
              </p>

              <!-- Buttons -->
              <div class="flex gap-4">
                <button *ngIf="!isRecording()" (click)="startRecording()"
                        [disabled]="submitting()"
                        class="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-xl font-semibold transition">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z"/>
                    <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                  Start Recording
                </button>

                <button *ngIf="isRecording()" (click)="stopRecording()"
                        class="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-semibold transition animate-pulse">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                  Stop
                </button>
              </div>

              <!-- Preview recorded audio -->
              <div *ngIf="recordedBlob() && !isRecording()" class="w-full">
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-2">Preview your recording</p>
                <audio controls [src]="recordedUrl()" class="w-full rounded-lg accent-violet-500"></audio>
                <div class="flex gap-3 mt-4">
                  <button (click)="submitRecording()"
                          [disabled]="submitting()"
                          class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                    <span *ngIf="submitting()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ submitting() ? 'Submitting…' : 'Submit for Evaluation' }}
                  </button>
                  <button (click)="resetRecording()"
                          class="px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition">
                    Re-record
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ── LATEST RESULT ──────────────────────────────── -->
          <div *ngIf="latestRecording()" class="bg-white/[0.03] border border-white/8 rounded-2xl p-8">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-black">2</span>
              Latest Result
              <span class="ml-auto text-xs px-2 py-1 rounded-lg {{ latestRecording()!.status | statusColor }}">
                {{ latestRecording()!.status }}
              </span>
            </h2>

            <!-- Processing state -->
            <div *ngIf="latestRecording()!.status === 'PROCESSING'"
                 class="flex flex-col items-center py-10 gap-4 text-slate-400">
              <div class="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-sm">AI is analyzing your pronunciation…</p>
            </div>

            <!-- Scores (only when completed) -->
            <ng-container *ngIf="latestRecording()!.status === 'COMPLETED'">
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <ng-container *ngFor="let s of scoreItems()">
                  <div class="flex flex-col items-center bg-black/20 rounded-xl py-4">
                    <div class="text-2xl font-black mb-1" [class]="s.value | scoreColor">
                      {{ s.value | number:'1.0-0' }}
                    </div>
                    <p class="text-xs text-slate-500">{{ s.label }}</p>
                  </div>
                </ng-container>
              </div>

              <!-- AI Feedback -->
              <div *ngIf="latestRecording()!.aiFeedback"
                   class="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-5 py-4 mb-4">
                <p class="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">AI Feedback</p>
                <p class="text-slate-300 text-sm leading-relaxed">{{ latestRecording()!.aiFeedback }}</p>
              </div>

              <!-- Problematic phonemes -->
              <div *ngIf="latestRecording()!.problematicPhonemes?.length">
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phonemes to Work On</p>
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let p of latestRecording()!.problematicPhonemes"
                        class="px-3 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm font-mono rounded-lg">
                    {{ p }}
                  </span>
                </div>
              </div>
            </ng-container>
          </div>

        </div>
      </ng-container>
    </div>
  `,
})
export class ChallengeDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private svc = inject(PronunciationService);

  challenge = signal<PronunciationChallenge | null>(null);
  latestRecording = signal<UserRecording | null>(null);
  loading = signal(true);

  isRecording = signal(false);
  recordedBlob = signal<Blob | null>(null);
  recordedUrl = signal('');
  submitting = signal(false);
  submitSuccess = signal(false);
  recordError = signal('');
  recordingSeconds = signal(0);
  isPolling = signal(false);

  bars = Array.from({ length: 40 }, () => Math.random() * 32 + 4);

  private mediaRecorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private timerInterval?: any;
  private pollingInterval?: any;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getChallengeById(id).subscribe({
      next: (c) => { this.challenge.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.svc.getChallengeRecordings(id, 0, 1).subscribe({
      next: (page) => {
        if (page.content.length) this.latestRecording.set(page.content[0]);
      },
    });
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
    clearInterval(this.pollingInterval);
    this.mediaRecorder?.stream?.getTracks().forEach(t => t.stop());
  }

  async startRecording() {
    this.recordError.set('');
    this.submitSuccess.set(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.recordedBlob.set(blob);
        this.recordedUrl.set(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        clearInterval(this.timerInterval);
      };
      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingSeconds.set(0);
      this.timerInterval = setInterval(() => {
        this.recordingSeconds.update(s => s + 1);
        this.bars = this.bars.map(() => Math.random() * 40 + 4);
      }, 1000);
    } catch {
      this.recordError.set('Microphone access denied. Please allow microphone access.');
    }
  }

  stopRecording() {
    this.mediaRecorder?.stop();
    this.isRecording.set(false);
  }

  resetRecording() {
    this.recordedBlob.set(null);
    this.recordedUrl.set('');
    this.submitSuccess.set(false);
    this.recordError.set('');
  }

submitRecording() {
  const blob = this.recordedBlob();
  const challenge = this.challenge();
  if (!blob || !challenge) return;

  const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
  this.submitting.set(true);

  this.svc.submitRecording(challenge.id, MOCK_USER_ID, file).subscribe({
    next: (rec) => {
      this.latestRecording.set(rec);
      this.submitting.set(false);
      this.submitSuccess.set(true);
      this.resetRecording();
      // Poll using the exact recording ID returned
      if (rec.status === 'PROCESSING') {
        this.startPolling(rec.id);
      }
    },
    error: () => {
      this.recordError.set('Submission failed. Please try again.');
      this.submitting.set(false);
    },
  });
}

private startPolling(recordingId: number) {
  this.isPolling.set(true);
  clearInterval(this.pollingInterval);

  this.pollingInterval = setInterval(() => {
    this.svc.getRecordingById(recordingId).subscribe({
      next: (rec) => {
        this.latestRecording.set(rec);
        if (rec.status === 'COMPLETED') {
          clearInterval(this.pollingInterval);
          this.isPolling.set(false);
        }
      },
      error: () => {
        clearInterval(this.pollingInterval);
        this.isPolling.set(false);
      }
    });
  }, 2000);
}


  scoreItems() {
    const r = this.latestRecording();
    if (!r) return [];
    return [
      { label: 'Overall',       value: r.overallScore },
      { label: 'Pronunciation', value: r.pronunciationScore },
      { label: 'Fluency',       value: r.fluencyScore },
      { label: 'Intonation',    value: r.intonationScore },
      { label: 'Clarity',       value: r.clarityScore },
    ];
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }
}