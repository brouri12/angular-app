import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface QuestionResult {
  id: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
}

interface GameResult {
  status: 'pass' | 'partial' | 'fail';
  score: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: string;
  xpEarned: number;
  totalXp: number;
  level: number;
  progressBar: number;
  feedback?: string;
  gameName?: string;
  questions: QuestionResult[];
}

@Component({
  selector: 'app-challenge-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './challenge-results.html',
  styleUrl: './challenge-results.css'
})
export class ChallengeResults implements OnInit {
  result = signal<GameResult | null>(null);
  showExplanations = signal(true);
  loading = signal(true);
  showPoster = signal(false);

  // Computed
  wrongAnswers = computed(() =>
    this.result()?.questions.filter(q => !q.isCorrect) || []
  );

  isExcellent = computed(() => (this.result()?.accuracy || 0) >= 90);

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state || history.state) as { result: GameResult };
    if (state?.result) {
      this.result.set(state.result);
      // Auto-show poster if accuracy >= 90%
      if ((state.result.accuracy || 0) >= 90) {
        setTimeout(() => this.showPoster.set(true), 400);
      }
    }
    this.loading.set(false);
  }

  closePoster() { this.showPoster.set(false); }

  // ─── Status helpers ───────────────────────────────────────────────────────

  getStatusIcon(): string {
    const s = this.result()?.status;
    if (s === 'pass') return '🎉';
    if (s === 'partial') return '⚠️';
    return '😔';
  }

  getStatusText(): string {
    const s = this.result()?.status;
    if (s === 'pass') return 'Passed!';
    if (s === 'partial') return 'Partial Pass';
    return 'Failed';
  }

  getStatusColor(): string {
    const s = this.result()?.status;
    if (s === 'pass') return 'text-green-600 dark:text-green-400';
    if (s === 'partial') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  }

  getPerformanceBadge(): { icon: string; label: string; color: string } {
    const pct = this.result()?.accuracy || 0;
    if (pct === 100) return { icon: '🏆', label: 'Perfect Score!', color: 'text-yellow-600' };
    if (pct >= 90) return { icon: '⭐', label: 'Excellent!', color: 'text-green-600' };
    if (pct >= 70) return { icon: '👍', label: 'Good Job!', color: 'text-blue-600' };
    if (pct >= 50) return { icon: '💪', label: 'Keep Practicing', color: 'text-orange-600' };
    return { icon: '📚', label: 'Try Again', color: 'text-red-600' };
  }

  getScoreBarColor(): string {
    const pct = this.result()?.accuracy || 0;
    if (pct >= 70) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (pct >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-rose-500';
  }

  getQuestionResults(): QuestionResult[] {
    return this.result()?.questions || [];
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  retryGame() { this.router.navigate(['/games']); }
  viewAllGames() { this.router.navigate(['/games']); }
}
