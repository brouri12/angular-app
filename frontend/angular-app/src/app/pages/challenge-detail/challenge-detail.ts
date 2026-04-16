import { Component, OnInit, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { AuthService } from '../../services/auth.service';
import { Challenge, Question, SubmissionRequest } from '../../models/challenge.model';

@Component({
  selector: 'app-challenge-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge-detail.html',
  styleUrl: './challenge-detail.css'
})
export class ChallengeDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(ChallengeService);
  private authService = inject(AuthService);

  challenge = signal<Challenge | null>(null);
  loading = signal(true);
  submitting = signal(false);

  // Prediction
  prediction = signal<any | null>(null);
  loadingPrediction = signal(false);
  showPrediction = signal(true);

  // User answers
  answers = signal<{ [questionId: number]: string }>({});

  // Timer
  timeRemaining = signal<number | null>(null);
  timerInterval: any;

  // Progress
  currentQuestionIndex = signal(0);
  hintsUsed = signal(0);
  startTime: number = 0;

  // Expose Object for template
  Object = Object;

  // Computed
  currentQuestion = computed(() => {
    const ch = this.challenge();
    if (!ch || !ch.questions) return null;
    return ch.questions[this.currentQuestionIndex()];
  });

  progress = computed(() => {
    const ch = this.challenge();
    if (!ch || !ch.questions) return 0;
    const answered = Object.keys(this.answers()).length;
    return (answered / ch.questions.length) * 100;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadChallenge(+id);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadChallenge(id: number) {
    this.loading.set(true);
    this.challengeService.getChallengeById(id).subscribe({
      next: (data) => {
        this.challenge.set(data);
        this.loading.set(false);
        this.startTime = Date.now();

        if (data.timeLimit) {
          this.timeRemaining.set(data.timeLimit * 60);
          this.startTimer();
        }

        // Load prediction for current user
        this.loadPrediction(id);
      },
      error: (err) => {
        console.error('Error loading challenge:', err);
        this.loading.set(false);
      }
    });
  }

  loadPrediction(challengeId: number) {
    let user: any = null;
    this.authService.currentUser$.subscribe(u => user = u).unsubscribe();
    if (!user) return;

    const userId = user.id_user || user.id;
    this.loadingPrediction.set(true);
    this.challengeService.predictSuccess(userId, challengeId).subscribe({
      next: (data) => {
        this.prediction.set(data);
        this.loadingPrediction.set(false);
      },
      error: () => {
        // Prediction is optional — fail silently
        this.loadingPrediction.set(false);
      }
    });
  }

  getPredictionColor(): string {
    const p = this.prediction();
    if (!p) return 'text-gray-500';
    if (p.successProbability >= 70) return 'text-green-600';
    if (p.successProbability >= 45) return 'text-yellow-600';
    return 'text-red-500';
  }

  getPredictionBg(): string {
    const p = this.prediction();
    if (!p) return 'bg-gray-50 border-gray-200';
    if (p.successProbability >= 70) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (p.successProbability >= 45) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  }

  getPredictionIcon(): string {
    const p = this.prediction();
    if (!p) return '🎯';
    if (p.successProbability >= 70) return '🟢';
    if (p.successProbability >= 45) return '🟡';
    return '🔴';
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      const remaining = this.timeRemaining();
      if (remaining !== null && remaining > 0) {
        this.timeRemaining.set(remaining - 1);
      } else if (remaining === 0) {
        this.submitChallenge();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  setAnswer(questionId: number, answer: string) {
    this.answers.update(current => ({
      ...current,
      [questionId]: answer
    }));
  }

  nextQuestion() {
    const ch = this.challenge();
    if (ch && this.currentQuestionIndex() < ch.questions.length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
    }
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex.set(index);
  }

  canSubmit(): boolean {
    const ch = this.challenge();
    if (!ch) return false;
    return Object.keys(this.answers()).length === ch.questions.length;
  }

  submitChallenge() {
    const ch = this.challenge();
    if (!ch) return;

    let user: any = null;
    this.authService.currentUser$.subscribe(u => user = u).unsubscribe();

    if (!user) {
      alert('Please login to submit challenge');
      return;
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const completionTime = Math.floor((Date.now() - this.startTime) / 1000);

    const answersMap: { [key: number]: string } = {};
    Object.entries(this.answers()).forEach(([k, v]) => {
      answersMap[Number(k)] = v;
    });

    const request: SubmissionRequest = {
      challengeId: ch.id!,
      userId: user.id_user || user.id,
      answers: answersMap,
      completionTime,
      hintsUsed: this.hintsUsed()
    };

    this.submitting.set(true);
    this.challengeService.submitChallenge(request).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.router.navigate(['/challenge-result', response.id]);
      },
      error: (err) => {
        console.error('Error submitting challenge:', err);
        this.submitting.set(false);
        alert('Error submitting challenge. Please try again.');
      }
    });
  }

  getLevelLabel(level: string): string {
    return this.challengeService.getLevelLabel(level as any);
  }

  getLevelColor(level: string): string {
    return this.challengeService.getLevelColor(level as any);
  }

  getTypeIcon(type: string): string {
    return this.challengeService.getTypeIcon(type as any);
  }
}
