import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService, Game, Question, SubmissionResponse, QuestionResult } from '../../services/game.service';

type Phase = 'loading' | 'playing' | 'submitted';

@Component({
  selector: 'app-game-play',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './game-play.html',
  styleUrl: './game-play.css'
})
export class GamePlay implements OnInit, OnDestroy {
  game = signal<Game | null>(null);
  questions = signal<Question[]>([]);
  phase = signal<Phase>('loading');
  submitting = signal(false);

  // Answers map: questionId -> selected answer
  answers = signal<Record<number, string>>({});

  // Navigation
  currentIndex = signal(0);

  // Timer
  timeRemaining = signal<number | null>(null);
  timerInterval: any = null;

  // Expose Object for template
  Object = Object;

  startTime = 0;

  // ─── Computed ─────────────────────────────────────────────────────────────

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);

  progress = computed(() => {
    const total = this.questions().length;
    if (!total) return 0;
    const answered = Object.keys(this.answers()).length;
    return (answered / total) * 100;
  });

  canSubmit = computed(() => {
    const total = this.questions().length;
    if (!total) return false;
    return Object.keys(this.answers()).length === total;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/games']); return; }

    this.startTime = Date.now();

    this.gameService.getGame(id).subscribe({
      next: g => {
        this.game.set(g);
        const qs = g.questions || [];
        this.questions.set(qs);
        this.phase.set('playing');
        this.startTime = Date.now();

        // Start timer if game has a time limit (future feature)
        // if (g.timeLimit) { this.startTimer(g.timeLimit * 60); }
      },
      error: () => this.router.navigate(['/games'])
    });
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // ─── Answer selection ─────────────────────────────────────────────────────

  setAnswer(questionId: number, answer: string) {
    this.answers.update(current => ({ ...current, [questionId]: answer }));
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  nextQuestion() {
    const qs = this.questions();
    if (this.currentIndex() < qs.length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  previousQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  goToQuestion(index: number) {
    this.currentIndex.set(index);
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  submitGame() {
    const g = this.game();
    if (!g || this.submitting()) return;

    if (this.timerInterval) clearInterval(this.timerInterval);

    const completionTime = Math.floor((Date.now() - this.startTime) / 1000);

    this.submitting.set(true);
    this.gameService.submitGame({
      gameId: g.id,
      userId: 'default-user',
      answers: this.answers(),
      completionTime
    }).subscribe({
      next: res => {
        this.submitting.set(false);
        // Navigate to results page with full data
        this.router.navigate(['/results'], {
          state: {
            result: this.buildResultState(res, completionTime)
          }
        });
      },
      error: () => {
        this.submitting.set(false);
        // Navigate to results even on error with what we have
        this.router.navigate(['/games']);
      }
    });
  }

  private buildResultState(res: SubmissionResponse, completionTime: number) {
    const mins = Math.floor(completionTime / 60);
    const secs = completionTime % 60;

    let status: 'pass' | 'partial' | 'fail' = 'fail';
    if (res.status === 'PASSED') status = 'pass';
    else if (res.status === 'PARTIAL') status = 'partial';

    // Build question results from the response
    const questionResults = Object.values(res.questionResults || {}).map((qr: QuestionResult) => ({
      id: qr.questionId,
      questionText: this.questions().find(q => q.id === qr.questionId)?.questionText || '',
      userAnswer: qr.userAnswer || '(No answer)',
      correctAnswer: qr.correctAnswer || '',
      isCorrect: qr.isCorrect,
      explanation: qr.explanation || '',
      xpEarned: qr.pointsEarned || 0
    }));

    return {
      status,
      score: Math.round(res.percentage),
      accuracy: Math.round(res.percentage),
      totalQuestions: res.totalQuestions,
      correctAnswers: res.correctAnswers,
      timeSpent: mins > 0 ? `${mins}m ${secs}s` : `${secs}s`,
      xpEarned: res.score,
      totalXp: res.score,
      level: 1,
      progressBar: Math.round(res.percentage),
      feedback: res.feedback,
      gameName: this.game()?.title || 'Game',
      questions: questionResults
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  formatTime(seconds: number): string {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  }

  getGameIcon(type: string): string {
    return ({ QUIZ: '🧠', SENTENCE: '✏️' } as any)[type] || '🎮';
  }

  getGameTypeLabel(type: string): string {
    return ({ QUIZ: 'Multiple Choice', SENTENCE: 'Fill in the Blank' } as any)[type] || type;
  }

  getDifficultyBadge(difficulty: string): string {
    return ({
      EASY: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      HARD: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    } as any)[difficulty] || 'bg-gray-100 text-gray-800';
  }

  goHome() { this.router.navigate(['/games']); }
}
