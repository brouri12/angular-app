import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
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

  result = signal<SubmissionResponse | null>(null);
  loading = signal(true);
  showExplanations = signal(true);
  
  // Expose Math for template
  Math = Math;

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
      },
      error: (err) => {
        console.error('Error loading result:', err);
        this.loading.set(false);
      }
    });
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
