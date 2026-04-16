import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { AuthService } from '../../services/auth.service';
import { SubmissionResponse, QuestionResult } from '../../models/challenge.model';

@Component({
  selector: 'app-challenge-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './challenge-result.html',
  styleUrl: './challenge-result.css'
})
export class ChallengeResult implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private challengeService = inject(ChallengeService);
  private authService = inject(AuthService);

  result = signal<SubmissionResponse | null>(null);
  loading = signal(true);
  showExplanations = signal(true);
  userHistory = signal<any[]>([]);
  loadingHistory = signal(false);
  
  // Expose Math for template
  Math = Math;

  // Computed stats
  wrongAnswers = computed(() => {
    const res = this.result();
    if (!res) return [];
    return Object.values(res.questionResults).filter(q => !q.isCorrect);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadResult(+id);
    }
  }

  loadResult(id: number) {
    this.loading.set(true);
    this.challengeService.getSubmissionById(id).subscribe({
      next: (data) => {
        this.result.set(data);
        this.loading.set(false);
        this.loadUserHistory(data.userId);
      },
      error: (err) => {
        console.error('Error loading result:', err);
        this.loading.set(false);
      }
    });
  }

  loadUserHistory(userId: number) {
    this.loadingHistory.set(true);
    this.challengeService.getUserSubmissions(userId).subscribe({
      next: (data) => {
        this.userHistory.set(data.slice(0, 5)); // last 5
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false)
    });
  }

  // Format seconds to mm:ss
  formatTime(seconds: number): string {
    if (!seconds || seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  }

  // Performance badge
  getPerformanceBadge(): { label: string; color: string; icon: string } {
    const res = this.result();
    if (!res) return { label: '', color: '', icon: '' };
    const pct = res.percentage;
    if (pct === 100) return { label: 'Perfect Score!', color: 'text-yellow-500', icon: '🏆' };
    if (pct >= 90) return { label: 'Excellent!', color: 'text-green-500', icon: '⭐' };
    if (pct >= 70) return { label: 'Good Job!', color: 'text-blue-500', icon: '👍' };
    if (pct >= 50) return { label: 'Keep Practicing', color: 'text-orange-500', icon: '💪' };
    return { label: 'Try Again', color: 'text-red-500', icon: '📚' };
  }

  getStatusColor(): string {
    const res = this.result();
    if (!res) return 'text-gray-600';
    if (res.passed) return 'text-green-600';
    if (res.status === 'PARTIAL') return 'text-yellow-600';
    return 'text-red-600';
  }

  getStatusIcon(): string {
    const res = this.result();
    if (!res) return '❓';
    if (res.passed) return '🎉';
    if (res.status === 'PARTIAL') return '⚠️';
    return '❌';
  }

  getStatusText(): string {
    const res = this.result();
    if (!res) return 'Unknown';
    if (res.passed) return 'Passed!';
    if (res.status === 'PARTIAL') return 'Partial Pass';
    return 'Failed';
  }

  getQuestionResults(): QuestionResult[] {
    const res = this.result();
    if (!res || !res.questionResults) return [];
    return Object.values(res.questionResults);
  }

  getScoreBarWidth(): number {
    const res = this.result();
    if (!res) return 0;
    return Math.min(100, res.percentage);
  }

  getScoreBarColor(): string {
    const res = this.result();
    if (!res) return 'bg-gray-400';
    if (res.percentage >= 70) return 'bg-green-500';
    if (res.percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  retryChallenge() {
    const res = this.result();
    if (res) {
      this.router.navigate(['/challenge', res.challengeId]);
    }
  }

  backToChallenges() {
    this.router.navigate(['/challenges']);
  }
}
