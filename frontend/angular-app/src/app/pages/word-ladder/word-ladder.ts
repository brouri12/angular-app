import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// ─── APIVerve response types ───────────────────────────────────────────────────
interface ApiResponse {
  status: string;
  data: {
    startWord: string;
    endWord: string;
    ladder: string[];
    steps: number;
  };
}

const PROXY_URL = `${environment.gameServiceUrl}/api/wordladder/generate`;
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Timer: easy=120s, medium=180s, hard=240s
const TIMER_MAP: Record<string, number> = { easy: 120, medium: 180, hard: 240 };

@Component({
  selector: 'app-word-ladder',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './word-ladder.html',
  styleUrl: './word-ladder.css'
})
export class WordLadderPage implements OnInit, OnDestroy {
  loading = signal(true);
  error = signal<string | null>(null);
  showResults = signal(false);

  startWord = signal('');
  endWord = signal('');
  ladder = signal<string[]>([]);       // correct solution from API
  difficulty = signal('medium');

  // Player's guesses — one input per step (excluding start word)
  userGuesses = signal<string[]>([]);

  timeRemaining = signal(180);
  timerInterval: any = null;
  timerActive = signal(false);
  startTime = 0;

  correctSteps = signal(0);
  totalSteps = signal(0);
  xpEarned = signal(0);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { this.loadNewLadder(); }
  ngOnDestroy() { this.stopTimer(); }

  // ─── Load ──────────────────────────────────────────────────────────────────

  loadNewLadder() {
    this.loading.set(true);
    this.error.set(null);
    this.showResults.set(false);
    this.stopTimer();

    const diff = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
    this.difficulty.set(diff);

    this.http.get<ApiResponse>(`${PROXY_URL}?difficulty=${diff}`).subscribe({
      next: res => {
        if (!res || res.status !== 'ok' || !res.data?.ladder?.length) {
          this.error.set('Failed to load word ladder. Please try again.');
          this.loading.set(false);
          return;
        }
        const data = res.data;
        this.startWord.set(data.startWord.toUpperCase());
        this.endWord.set(data.endWord.toUpperCase());
        this.ladder.set(data.ladder.map(w => w.toUpperCase()));

        // Steps = ladder length - 1 (exclude start word, player fills the rest)
        const steps = data.ladder.length - 1;
        this.totalSteps.set(steps);
        this.userGuesses.set(Array(steps).fill(''));

        this.loading.set(false);
        this.startTimer(TIMER_MAP[diff] ?? 180);
        this.startTime = Date.now();
      },
      error: err => {
        const msg = err.status === 401 ? 'Invalid API key.'
          : err.status === 429 ? 'Rate limit reached. Wait a moment.'
          : err.status === 0 ? 'Network error. Check your connection.'
          : `API error (${err.status ?? 'unknown'}).`;
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }

  // ─── Timer ─────────────────────────────────────────────────────────────────

  startTimer(seconds: number) {
    this.timeRemaining.set(seconds);
    this.timerActive.set(true);
    this.timerInterval = setInterval(() => {
      const r = this.timeRemaining() - 1;
      this.timeRemaining.set(r);
      if (r <= 0) { this.stopTimer(); this.checkAnswers(); }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerActive.set(false);
  }

  formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  // ─── Interaction ───────────────────────────────────────────────────────────

  updateGuess(index: number, value: string) {
    const guesses = [...this.userGuesses()];
    guesses[index] = value.toUpperCase().trim();
    this.userGuesses.set(guesses);
  }

  // ─── Submit ────────────────────────────────────────────────────────────────

  checkAnswers() {
    this.stopTimer();
    const solution = this.ladder();   // full ladder including start word
    const guesses = this.userGuesses();
    let correct = 0;

    // solution[0] = startWord (given), solution[1..n] = steps player must fill
    for (let i = 0; i < guesses.length; i++) {
      if (guesses[i].toUpperCase() === solution[i + 1]?.toUpperCase()) {
        correct++;
      }
    }

    const xp = correct * 20; // +20 XP per correct step
    this.correctSteps.set(correct);
    this.xpEarned.set(xp);
    this.showResults.set(true);

    // Save accuracy to localStorage
    const accuracy = guesses.length > 0 ? (correct / guesses.length) * 100 : 0;
    localStorage.setItem('wordladder_last_accuracy', accuracy.toFixed(1));

    // Award XP via backend (gameId = -1 reserved for Word Ladder)
    this.http.post(`${environment.gameServiceUrl}/api/submissions`, {
      gameId: -1,
      userId: 'default-user',
      answers: {},
      completionTime: Math.floor((Date.now() - this.startTime) / 1000),
      scoreOverride: xp,
      correctOverride: correct,
      totalOverride: guesses.length
    }).subscribe({ error: () => {} });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  isStepCorrect(index: number): boolean {
    if (!this.showResults()) return false;
    return this.userGuesses()[index]?.toUpperCase() === this.ladder()[index + 1]?.toUpperCase();
  }

  isStepWrong(index: number): boolean {
    if (!this.showResults()) return false;
    const g = this.userGuesses()[index];
    return !!g && g.toUpperCase() !== this.ladder()[index + 1]?.toUpperCase();
  }

  getStepRange(): number[] {
    return Array.from({ length: this.totalSteps() }, (_, i) => i);
  }

  get filledCount(): number {
    return this.userGuesses().filter(g => g.trim().length > 0).length;
  }

  playAgain() { this.loadNewLadder(); }
  goHome() { this.router.navigate(['/games']); }
}
