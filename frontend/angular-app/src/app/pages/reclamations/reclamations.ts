import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';
import { ResolutionAction, ResolutionActionService } from '../../services/resolution-action.service';

@Component({
  selector: 'app-reclamations',
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamations.html',
  styleUrl: './reclamations.css'
})
export class Reclamations implements OnInit {
  reclamations: Reclamation[] = [];
  resolutionActionsByReclamationId: Map<number, ResolutionAction[]> = new Map();
  loading = true;
  error = '';

  showModal = false;
  newReclamation: Partial<Reclamation> = {
    objet: '',
    description: ''
  };
  createError = '';
  creating = false;

  /** @deprecated Use showModal */
  get showForm(): boolean { return this.showModal; }
  set showForm(v: boolean) { this.showModal = v; }

  constructor(
    private reclamationService: ReclamationService,
    private resolutionActionService: ResolutionActionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.loading = true;
    this.error = '';
    this.reclamations = [];
    this.resolutionActionsByReclamationId = new Map();
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        const raw = data as unknown;
        if (Array.isArray(raw)) {
          this.reclamations = raw;
        } else if (raw && typeof raw === 'object' && Array.isArray((raw as { content?: Reclamation[] }).content)) {
          this.reclamations = (raw as { content: Reclamation[] }).content;
        } else if (raw && typeof raw === 'object' && Array.isArray((raw as { data?: Reclamation[] }).data)) {
          this.reclamations = (raw as { data: Reclamation[] }).data;
        } else {
          this.reclamations = [];
        }
        this.loadResolutionActions();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Unable to load reclamations. Please try again later.';
        this.loading = false;
        this.reclamations = [];
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  loadResolutionActions(): void {
    this.resolutionActionService.getAll().subscribe({
      next: (list) => {
        const actions = Array.isArray(list) ? list : [];
        const map = new Map<number, ResolutionAction[]>();
        for (const a of actions) {
          const recId = a.reclamationId;
          if (recId != null) {
            const arr = map.get(recId) ?? [];
            arr.push(a);
            map.set(recId, arr);
          }
        }
        this.resolutionActionsByReclamationId = map;
        this.cdr.detectChanges();
      },
      error: () => {
        this.resolutionActionsByReclamationId = new Map();
      }
    });
  }

  getResolutionActions(reclamationId: number | undefined): ResolutionAction[] {
    if (reclamationId == null) return [];
    return this.resolutionActionsByReclamationId.get(reclamationId) ?? [];
  }

  formatActionDate(value: string | Date | undefined): string {
    if (value == null) return '–';
    const d = typeof value === 'string' ? new Date(value) : value;
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  }

  openModal(): void {
    this.showModal = true;
    this.newReclamation = { objet: '', description: '' };
    this.createError = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.createError = '';
  }

  createReclamation(): void {
    if (!this.newReclamation.objet?.trim()) {
      this.createError = 'Please enter a subject.';
      return;
    }
    if (!this.newReclamation.description?.trim()) {
      this.createError = 'Please describe your issue.';
      return;
    }
    this.createError = '';
    this.creating = true;
    const reclamation: Reclamation = {
      objet: this.newReclamation.objet.trim(),
      description: this.newReclamation.description.trim(),
      status: 'pending',
      date: new Date()
    };
    this.reclamationService.create(reclamation).subscribe({
      next: (created) => {
        this.reclamations = [created, ...this.reclamations];
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

  deleteReclamation(id: number): void {
    if (confirm('Delete this reclamation?')) {
      this.reclamationService.delete(id).subscribe({
        next: () => {
          this.reclamations = this.reclamations.filter(r => r.id !== id);
          this.resolutionActionsByReclamationId.delete(id);
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    }
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    const s = status.toLowerCase().normalize('NFD').replace(/\u0308/g, '').replace(/[\u0300-\u036f]/g, '');
    if (s === 'pending' || s === 'en attente') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (s === 'in_progress' || s === 'en cours') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (s === 'resolved' || s === 'resolue') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (s === 'rejected' || s === 'rejetee') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
