import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ResolutionAction,
  ResolutionActionService,
} from '../../services/resolution-action.service';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-resolutions',
  imports: [CommonModule, FormsModule],
  templateUrl: './resolutions.html',
  styleUrl: './resolutions.css',
})
export class Resolutions implements OnInit {
  resolutions: ResolutionAction[] = [];
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
  deleteTarget: ResolutionAction | null = null;

  editModalOpen = false;
  editTarget: ResolutionAction | null = null;
  editAction = '';
  editResponsable = '';
  editSaving = false;
  editError = '';

  createModalOpen = false;
  createReclamationId: number | null = null;
  createAction = '';
  createResponsable = '';
  createSaving = false;
  createError = '';

  constructor(
    private resolutionService: ResolutionActionService,
    private reclamationService: ReclamationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReclamations();
    this.loadResolutions();
  }

  loadReclamations(): void {
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.reclamations = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.reclamations = [];
      },
    });
  }

  loadResolutions(): void {
    this.loading = true;
    this.error = '';
    this.resolutions = [];
    this.resolutionService.getAll().subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : [];
        this.resolutions = list;
        this.currentPage = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error =
          'Cannot load resolution actions. Is service-feedback running on http://localhost:8082?';
        this.loading = false;
        this.resolutions = [];
        this.cdr.detectChanges();
        console.error('loadResolutions failed', err);
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filteredResolutions(): ResolutionAction[] {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) return this.resolutions;
    return this.resolutions.filter((r) => {
      const id = String(r.id ?? '');
      const recId = String(r.reclamationId ?? '');
      const recTitle = (this.getReclamationTitle(r.reclamationId) || '').toLowerCase();
      const action = (r.action || '').toLowerCase();
      const resp = (r.responsable || '').toLowerCase();
      return (
        id.includes(term) ||
        recId.includes(term) ||
        recTitle.includes(term) ||
        action.includes(term) ||
        resp.includes(term)
      );
    });
  }

  getReclamationTitle(reclamationId: number | undefined): string {
    if (reclamationId == null) return '';
    const rec = this.reclamations.find((r) => r.id === reclamationId);
    return rec?.objet ?? '';
  }

  get totalFiltered(): number {
    return this.filteredResolutions.length;
  }

  get paginatedResolutions(): ResolutionAction[] {
    const list = this.filteredResolutions;
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get startItem(): number {
    return this.totalFiltered === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
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

  openDeleteModal(item: ResolutionAction): void {
    this.deleteTarget = item;
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
    this.resolutionService.delete(id).subscribe({
      next: () => {
        this.resolutions = this.resolutions.filter((r) => r.id !== id);
        this.deletingId = null;
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleteError = 'Failed to delete. Check service-feedback on 8082.';
        this.deletingId = null;
        console.error('Delete failed', err);
      },
    });
  }

  openEditModal(item: ResolutionAction): void {
    this.editTarget = item;
    this.editAction = item.action ?? '';
    this.editResponsable = item.responsable ?? '';
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
    this.editSaving = true;
    const payload: ResolutionAction = {
      id: this.editTarget.id,
      reclamationId: this.editTarget.reclamationId,
      action: this.editAction.trim() || undefined,
      responsable: this.editResponsable.trim() || undefined,
      dateAction: this.editTarget.dateAction,
    };
    this.resolutionService.update(this.editTarget.id, payload).subscribe({
      next: (updated) => {
        const idx = this.resolutions.findIndex(
          (r) => r.id === this.editTarget!.id
        );
        if (idx !== -1)
          this.resolutions[idx] = { ...this.resolutions[idx], ...updated };
        this.editSaving = false;
        this.closeEditModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.editError =
          'Failed to update. Check service-feedback on 8082.';
        this.editSaving = false;
        console.error('Update failed', err);
      },
    });
  }

  openCreateModal(): void {
    this.createReclamationId = this.reclamations.length > 0 ? this.reclamations[0].id ?? null : null;
    this.createAction = '';
    this.createResponsable = '';
    this.createModalOpen = true;
    this.createError = '';
  }

  closeCreateModal(): void {
    this.createModalOpen = false;
    this.createError = '';
  }

  saveCreate(): void {
    this.createError = '';
    const recId = this.createReclamationId;
    if (recId == null || recId <= 0) {
      this.createError = 'Please select a reclamation.';
      return;
    }
    if (!this.createAction?.trim()) {
      this.createError = 'Action is required.';
      return;
    }
    this.createSaving = true;
    const payload: ResolutionAction = {
      reclamationId: recId,
      action: this.createAction.trim(),
      responsable: this.createResponsable.trim() || undefined,
    };
    this.resolutionService.create(payload).subscribe({
      next: (created) => {
        this.resolutions = [created, ...this.resolutions];
        this.createSaving = false;
        this.closeCreateModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.createError =
          err?.error?.message || 'Failed to create. Check service-feedback on 8082 and that reclamation exists.';
        this.createSaving = false;
        console.error('Create failed', err);
      },
    });
  }

  formatDate(value: Date | string | undefined): string {
    if (value == null) return '–';
    const d = typeof value === 'string' ? new Date(value) : value;
    return isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  }
}
