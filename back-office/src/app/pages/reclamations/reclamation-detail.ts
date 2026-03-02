import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Reclamation, ReclamationService } from '../../services/reclamation.service';
import { ResolutionAction, ResolutionActionService } from '../../services/resolution-action.service';

@Component({
  selector: 'app-reclamation-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './reclamation-detail.html',
  styleUrl: './reclamation-detail.css'
})
export class ReclamationDetail implements OnInit {
  reclamation: Reclamation | null = null;
  resolutionActions: ResolutionAction[] = [];
  loading = true;
  error = '';
  
  // For adding new resolution action
  showAddAction = false;
  newAction: Partial<ResolutionAction> = {
    action: '',
    responsable: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reclamationService: ReclamationService,
    private resolutionActionService: ResolutionActionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReclamation(+id);
    }
  }

  loadReclamation(id: number): void {
    this.loading = true;
    this.reclamationService.getById(id).subscribe({
      next: (data) => {
        this.reclamation = data;
        this.loadResolutionActions(id);
      },
      error: (err) => {
        this.error = 'Failed to load reclamation';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadResolutionActions(reclamationId: number): void {
    this.resolutionActionService.getByReclamation(reclamationId).subscribe({
      next: (data) => {
        this.resolutionActions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load resolution actions', err);
        this.loading = false;
      }
    });
  }

  updateStatus(status: string): void {
    if (this.reclamation?.id) {
      this.reclamationService.updateStatus(this.reclamation.id, status).subscribe({
        next: (updated) => {
          this.reclamation = updated;
        },
        error: (err) => {
          console.error('Failed to update status', err);
        }
      });
    }
  }

  addResolutionAction(): void {
    if (this.reclamation?.id && this.newAction.action && this.newAction.responsable) {
      const action: ResolutionAction = {
        action: this.newAction.action,
        responsable: this.newAction.responsable,
        reclamationId: this.reclamation.id
      };
      
      this.resolutionActionService.create(action).subscribe({
        next: (created) => {
          this.resolutionActions.push(created);
          this.showAddAction = false;
          this.newAction = { action: '', responsable: '' };
        },
        error: (err) => {
          console.error('Failed to add resolution action', err);
        }
      });
    }
  }

  deleteResolutionAction(id: number): void {
    if (confirm('Are you sure you want to delete this resolution action?')) {
      this.resolutionActionService.delete(id).subscribe({
        next: () => {
          this.resolutionActions = this.resolutionActions.filter(a => a.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete resolution action', err);
        }
      });
    }
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
}
