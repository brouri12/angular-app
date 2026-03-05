import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Feedback, FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedbacks',
  imports: [CommonModule, FormsModule],
  templateUrl: './feedbacks.html',
  styleUrl: './feedbacks.css'
})
export class Feedbacks implements OnInit {
  feedbacks: Feedback[] = [];
  loading = true;
  error = '';

  showModal = false;
  newFeedback: Partial<Feedback> = {
    note: 5,
    commentaire: '',
    moduleId: undefined
  };
  createError = '';
  creating = false;

  editModalOpen = false;
  editTarget: Feedback | null = null;
  editNote = 5;
  editCommentaire = '';
  editModuleId: number | undefined;
  editSaving = false;
  editError = '';

constructor(
    private feedbackService: FeedbackService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  loadFeedbacks(): void {
    this.loading = true;
    this.error = '';
    this.feedbacks = [];
    this.feedbackService.getAll().subscribe({
      next: (data) => {
        const raw = data as unknown;
        if (Array.isArray(raw)) {
          this.feedbacks = raw;
        } else if (raw && typeof raw === 'object' && Array.isArray((raw as { content?: Feedback[] }).content)) {
          this.feedbacks = (raw as { content: Feedback[] }).content;
        } else if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: Feedback[] }).data)) {
          this.feedbacks = (raw as { data: Feedback[] }).data;
        } else {
          this.feedbacks = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Unable to load feedbacks. Please try again later.';
        this.loading = false;
        this.feedbacks = [];
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  openModal(): void {
    this.showModal = true;
    this.newFeedback = { note: 5, commentaire: '', moduleId: undefined };
    this.createError = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.createError = '';
  }

  createFeedback(): void {
    if (!this.newFeedback.note || !this.newFeedback.commentaire?.trim()) {
      this.createError = 'Please give a rating and write a comment.';
      return;
    }
    this.createError = '';
    this.creating = true;
const feedback: Feedback = {
      note: this.newFeedback.note,
      commentaire: this.newFeedback.commentaire.trim(),
      moduleId: this.newFeedback.moduleId ?? undefined,
      date: new Date().toISOString()
    };
    this.feedbackService.create(feedback).subscribe({
      next: (created) => {
        this.feedbacks = [created, ...this.feedbacks];
        this.creating = false;
        this.closeModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.createError = 'Could not submit. Please try again.';
        this.creating = false;
        console.error(err);
      }
    });
  }

  openEditModal(feedback: Feedback): void {
    this.editTarget = feedback;
    this.editNote = feedback.note ?? 5;
    this.editCommentaire = feedback.commentaire ?? '';
    this.editModuleId = feedback.moduleId;
    this.editModalOpen = true;
    this.editError = '';
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.editTarget = null;
    this.editError = '';
  }

  saveEdit(): void {
    if (!this.editTarget?.id) return;
    if (this.editNote < 1 || this.editNote > 5) {
      this.editError = 'Rating must be between 1 and 5.';
      return;
    }
    if (!this.editCommentaire?.trim()) {
      this.editError = 'Comment is required.';
      return;
    }
    this.editError = '';
    this.editSaving = true;
    const payload: Feedback = {
      id: this.editTarget.id,
      userId: this.editTarget.userId,
      moduleId: this.editModuleId ?? this.editTarget.moduleId,
      note: this.editNote,
      commentaire: this.editCommentaire.trim(),
      date: this.editTarget.date
    };
    this.feedbackService.update(this.editTarget.id, payload).subscribe({
      next: (updated) => {
        const idx = this.feedbacks.findIndex(f => f.id === this.editTarget!.id);
        if (idx !== -1) this.feedbacks[idx] = { ...this.feedbacks[idx], ...updated };
        this.editSaving = false;
        this.closeEditModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.editError = 'Could not update. Please try again.';
        this.editSaving = false;
        console.error(err);
      }
    });
  }

  deleteFeedback(id: number): void {
    if (confirm('Delete this feedback?')) {
      this.feedbackService.delete(id).subscribe({
        next: () => {
          this.feedbacks = this.feedbacks.filter(f => f.id !== id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  getNoteClass(note: number): string {
    if (note >= 4) return 'text-green-600 dark:text-green-400';
    if (note >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  getSentimentEmoji(sentiment?: string): string {
    switch (sentiment) {
      case 'POSITIF': return '😊';
      case 'NEGATIF': return '😞';
      default: return '😐';
    }
  }

  getSentimentClass(sentiment?: string): string {
    switch (sentiment) {
      case 'POSITIF': return 'sentiment-positif';
      case 'NEGATIF': return 'sentiment-negatif';
      default: return 'sentiment-neutre';
    }
  }

  downloadPdf(): void {
    this.feedbackService.downloadFeedbacksPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'feedbacks_report.pdf';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
        alert('Erreur lors du téléchargement du rapport PDF');
      }
    });
  }

downloadExcel(): void {
    this.feedbackService.downloadFeedbacksExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'feedbacks_report.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading Excel:', err);
        alert('Erreur lors du téléchargement du rapport Excel');
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/feedbacks-dashboard']);
  }
}
