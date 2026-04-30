import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Feedback, FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedbacks',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feedbacks.html',
  styleUrl: './feedbacks.css'
})
export class Feedbacks implements OnInit {
  feedbacks: Feedback[] = [];
  loading = true;
  error = '';
  deleteError = '';
  deletingId: number | null = null;

  searchTerm = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 1;

  deleteModalOpen = false;
  deleteTarget: Feedback | null = null;

  editModalOpen = false;
  editTarget: Feedback | null = null;
  editNote = 0;
  editCommentaire = '';
  editSaving = false;
  editError = '';

  constructor(
    private feedbackService: FeedbackService,
    private cdr: ChangeDetectorRef
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
        const list = Array.isArray(data) ? data : [];
        this.feedbacks = list;
        this.currentPage = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Cannot load feedbacks. Is service-feedback running on http://localhost:8082?';
        this.loading = false;
        this.feedbacks = [];
        this.cdr.detectChanges();
        console.error('loadFeedbacks failed', err);
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredFeedbacks(): Feedback[] {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) return this.feedbacks;
    return this.feedbacks.filter(f => {
      const comment = (f.commentaire || '').toLowerCase();
      const id = String(f.id ?? '');
      const userId = String(f.userId ?? '');
      const moduleId = String(f.moduleId ?? '');
      const note = String(f.note ?? '');
      return id.includes(term) || userId.includes(term) || moduleId.includes(term) || note.includes(term) || comment.includes(term);
    });
  }

  get totalFiltered(): number {
    return this.filteredFeedbacks.length;
  }

  get paginatedFeedbacks(): Feedback[] {
    const list = this.filteredFeedbacks;
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get startItem(): number {
    return this.totalFiltered === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalFiltered);
  }

  get canPrev(): boolean {
    return this.currentPage > 1;
  }

  get canNext(): boolean {
    return this.currentPage * this.pageSize < this.totalFiltered;
  }

  prevPage(): void {
    if (this.canPrev) this.currentPage--;
  }

  nextPage(): void {
    if (this.canNext) this.currentPage++;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  openDeleteModal(feedback: Feedback): void {
    this.deleteTarget = feedback;
    this.deleteModalOpen = true;
    this.deleteError = '';
  }

  closeDeleteModal(): void {
    this.deleteModalOpen = false;
    this.deleteTarget = null;
    this.deleteError = '';
  }

  confirmDelete(): void {
    if (!this.deleteTarget?.id) return;
    const id = this.deleteTarget.id;
    this.deletingId = id;
    this.feedbackService.delete(id).subscribe({
      next: () => {
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
        this.deletingId = null;
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleteError = 'Failed to delete. Check gateway (8080) and service-feedback are running.';
        this.deletingId = null;
        console.error('Delete failed', err);
      }
    });
  }

  openEditModal(feedback: Feedback): void {
    this.editTarget = feedback;
    this.editNote = feedback.note ?? 0;
    this.editCommentaire = feedback.commentaire ?? '';
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
    this.editError = '';
    if (this.editNote < 1 || this.editNote > 5) {
      this.editError = 'Note must be between 1 and 5.';
      return;
    }
    this.editSaving = true;
    const payload: Feedback = {
      id: this.editTarget.id,
      userId: this.editTarget.userId,
      moduleId: this.editTarget.moduleId,
      note: this.editNote,
      commentaire: this.editCommentaire,
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
        this.editError = 'Failed to update. Check gateway (8080) and service-feedback are running.';
        this.editSaving = false;
        console.error('Update failed', err);
      }
    });
  }

  getNoteClass(note: number): string {
    if (note >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (note >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  formatDate(value: Date | string | undefined): string {
    if (value == null) return '–';
    const d = typeof value === 'string' ? new Date(value) : value;
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { dateStyle: 'short' });
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
}
