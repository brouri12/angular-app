import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Feedback, FeedbackService } from '../../../services/feedback.service';

@Component({
  selector: 'app-feedback-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './feedback-detail.html',
  styleUrl: './feedback-detail.css'
})
export class FeedbackDetail implements OnInit {
  feedback: Feedback | null = null;
  loading = true;
  error = '';
  deleteError = '';
  deleting = false;
  feedbackId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.feedbackId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.feedbackId) {
      this.loadFeedback();
    }
  }

  loadFeedback(): void {
    this.loading = true;
    this.error = '';
    this.feedbackService.getById(this.feedbackId).subscribe({
      next: (data) => {
        this.feedback = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load feedback. Is the API running?';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteFeedback(): void {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    this.deleteError = '';
    this.deleting = true;
    this.feedbackService.delete(this.feedbackId).subscribe({
      next: () => {
        this.router.navigate(['/feedbacks']);
      },
      error: (err) => {
        this.deleteError = 'Failed to delete. Try again.';
        this.deleting = false;
        console.error('Failed to delete feedback', err);
      }
    });
  }

  getNoteClass(note: number | undefined): string {
    if (!note) return 'text-gray-600';
    if (note >= 4) return 'text-green-600 dark:text-green-400';
    if (note >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }
}
