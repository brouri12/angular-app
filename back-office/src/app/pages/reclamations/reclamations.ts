import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-reclamations',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reclamations.html',
  styleUrl: './reclamations.css'
})
export class Reclamations implements OnInit {
  reclamations: Reclamation[] = [];
  loading = true;
  error = '';
  deleteError = '';
  deletingId: number | null = null;

  searchTerm = '';
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 1;

  deleteModalOpen = false;
  deleteTarget: Reclamation | null = null;

  editModalOpen = false;
  editTarget: Reclamation | null = null;
  editStatus = '';
  editSaving = false;
  editError = '';
  statusOptions = ['pending', 'in_progress', 'resolved', 'rejected'];

  createModalOpen = false;
  createObjet = '';
  createDescription = '';
  createStatus = 'pending';
  createSaving = false;
  createError = '';

  constructor(
    private reclamationService: ReclamationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.loading = true;
    this.error = '';
    this.reclamations = [];
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.reclamations = list;
        this.currentPage = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Cannot load reclamations. Is service-feedback running on http://localhost:8082?';
        this.loading = false;
        this.reclamations = [];
        this.cdr.detectChanges();
        console.error('loadReclamations failed', err);
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredReclamations(): Reclamation[] {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) return this.reclamations;
    return this.reclamations.filter(r => {
      const id = String(r.id ?? '');
      const userId = String(r.userId ?? '');
      const objet = (r.objet || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
      const status = (r.status || '').toLowerCase();
      return id.includes(term) || userId.includes(term) || objet.includes(term) || desc.includes(term) || status.includes(term);
    });
  }

  get totalFiltered(): number {
    return this.filteredReclamations.length;
  }

  get paginatedReclamations(): Reclamation[] {
    const list = this.filteredReclamations;
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

  openDeleteModal(rec: Reclamation): void {
    this.deleteTarget = rec;
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
    this.reclamationService.delete(id).subscribe({
      next: () => {
        this.reclamations = this.reclamations.filter(r => r.id !== id);
        this.deletingId = null;
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleteError = 'Failed to delete. Check service-feedback on 8082.';
        this.deletingId = null;
        console.error('Delete failed', err);
      }
    });
  }

  openEditModal(rec: Reclamation): void {
    this.editTarget = rec;
    this.editStatus = rec.status ?? 'pending';
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
    if (!this.editStatus?.trim()) {
      this.editError = 'Please select a status.';
      return;
    }
    this.editSaving = true;
    this.reclamationService.updateStatus(this.editTarget.id, this.editStatus).subscribe({
      next: (updated) => {
        const idx = this.reclamations.findIndex(r => r.id === this.editTarget!.id);
        if (idx !== -1) this.reclamations[idx] = { ...this.reclamations[idx], ...updated };
        this.editSaving = false;
        this.closeEditModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.editError = 'Failed to update. Check service-feedback on 8082.';
        this.editSaving = false;
        console.error('Update failed', err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  formatDate(value: Date | string | undefined): string {
    if (value == null) return '–';
    const d = typeof value === 'string' ? new Date(value) : value;
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  }

  openCreateModal(): void {
    this.createObjet = '';
    this.createDescription = '';
    this.createStatus = 'pending';
    this.createModalOpen = true;
    this.createError = '';
  }

  closeCreateModal(): void {
    this.createModalOpen = false;
    this.createError = '';
  }

  saveCreate(): void {
    this.createError = '';
    if (!this.createObjet?.trim()) {
      this.createError = 'Subject is required.';
      return;
    }
    if (!this.createDescription?.trim()) {
      this.createError = 'Description is required.';
      return;
    }
    this.createSaving = true;
    const payload: Reclamation = {
      objet: this.createObjet.trim(),
      description: this.createDescription.trim(),
      status: this.createStatus || 'pending'
    };
    this.reclamationService.create(payload).subscribe({
      next: (created) => {
        this.reclamations = [created, ...this.reclamations];
        this.createSaving = false;
        this.closeCreateModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.createError = 'Failed to create. Check service-feedback on 8082.';
        this.createSaving = false;
        console.error('Create failed', err);
      }
    });
  }

  downloadPdf(): void {
    this.reclamationService.downloadReclamationsPdf().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reclamations_report.pdf';
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
    this.reclamationService.downloadReclamationsExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'reclamations_report.xlsx';
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
