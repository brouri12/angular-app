import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Reclamation, ReclamationService, PRIORITES, CATEGORIES } from '../../services/reclamation.service';

@Component({
  selector: 'app-reclamation-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './reclamation-detail.html',
  styleUrl: './reclamation-detail.css'
})
export class ReclamationDetail implements OnInit {
  reclamation: Reclamation | null = null;
  loading = true;
  error = '';
  priorites = PRIORITES;
  categories = CATEGORIES;

  constructor(
    private route: ActivatedRoute,
    private reclamationService: ReclamationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Route ID:', id);
    
    if (id) {
      this.loadReclamation(+id);
    } else {
      this.error = 'No ID provided';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  loadReclamation(id: number): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    
    console.log('Loading reclamation:', id);
    
    this.reclamationService.getById(id).subscribe({
      next: (data) => {
        console.log('Got data:', data);
        this.reclamation = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Failed to load reclamation';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    
    setTimeout(() => {
      if (this.loading) {
        console.log('Timeout reached');
        this.loading = false;
        this.error = 'Request timeout';
        this.cdr.detectChanges();
      }
    }, 5000);
  }

  updateStatus(status: string): void {
    if (this.reclamation?.id) {
      this.reclamationService.updateStatus(this.reclamation.id, status).subscribe({
        next: (updated) => {
          this.reclamation = updated;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update status', err);
        }
      });
    }
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    const s = status.toUpperCase();
    if (s === 'EN_ATTENTE' || s === 'PENDING') return 'bg-yellow-100 text-yellow-800';
    if (s === 'EN_COURS' || s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-800';
    if (s === 'RESOLUE' || s === 'RESOLVED') return 'bg-green-100 text-green-800';
    if (s === 'REJETEE' || s === 'REJECTED') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  getPrioriteClass(priorite: string | undefined): string {
    if (!priorite) return 'bg-gray-100 text-gray-800';
    const p = priorite.toUpperCase();
    switch (p) {
      case 'CRITIQUE': return 'bg-red-100 text-red-800';
      case 'HAUTE': return 'bg-orange-100 text-orange-800';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-800';
      case 'BASSE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPrioriteEmoji(priorite: string | undefined): string {
    if (!priorite) return '';
    const p = this.priorites.find(pr => pr.value === priorite);
    return p ? p.label : '';
  }

  getCategoryClass(categorie: string | undefined): string {
    if (!categorie) return 'bg-gray-100 text-gray-800';
    const cat = categorie.toUpperCase();
    if (cat === 'TECHNIQUE') return 'bg-blue-100 text-blue-800';
    if (cat === 'FACTURATION') return 'bg-green-100 text-green-800';
    if (cat === 'QUALITE') return 'bg-yellow-100 text-yellow-800';
    if (cat === 'ADMINISTRATIF') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  }

  getCategoryEmoji(categorie: string | undefined): string {
    if (!categorie) return '';
    const cat = this.categories.find(c => c.value === categorie);
    return cat ? cat.label : '';
  }
}

