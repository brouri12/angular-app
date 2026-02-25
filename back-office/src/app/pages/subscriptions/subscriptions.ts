import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbonnementService } from '../../services/abonnement.service';
import { Abonnement } from '../../models/abonnement.model';

@Component({
  selector: 'app-subscriptions',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css'
})
export class Subscriptions implements OnInit {
  private abonnementService = inject(AbonnementService);
  
  abonnements = signal<Abonnement[]>([]);
  filteredAbonnements = signal<Abonnement[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editMode = signal(false);
  
  searchTerm = signal('');
  filterStatut = signal('all');
  
  currentAbonnement: Abonnement = this.getEmptyAbonnement();

  ngOnInit() {
    this.loadAbonnements();
  }

  loadAbonnements() {
    this.loading.set(true);
    this.abonnementService.getAllAbonnements().subscribe({
      next: (data) => {
        this.abonnements.set(data);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading abonnements:', err);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = this.abonnements();
    
    // Filter by status
    if (this.filterStatut() !== 'all') {
      filtered = filtered.filter(a => a.statut === this.filterStatut());
    }
    
    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(a => 
        a.nom.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search)
      );
    }
    
    this.filteredAbonnements.set(filtered);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onFilterChange(statut: string) {
    this.filterStatut.set(statut);
    this.applyFilters();
  }

  openAddModal() {
    this.editMode.set(false);
    this.currentAbonnement = this.getEmptyAbonnement();
    this.showModal.set(true);
  }

  openEditModal(abonnement: Abonnement) {
    this.editMode.set(true);
    this.currentAbonnement = { ...abonnement };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentAbonnement = this.getEmptyAbonnement();
  }

  saveAbonnement() {
    if (this.editMode()) {
      // Update
      this.abonnementService.updateAbonnement(
        this.currentAbonnement.id_abonnement!,
        this.currentAbonnement
      ).subscribe({
        next: () => {
          this.loadAbonnements();
          this.closeModal();
        },
        error: (err) => console.error('Error updating abonnement:', err)
      });
    } else {
      // Create
      this.abonnementService.addAbonnement(this.currentAbonnement).subscribe({
        next: () => {
          this.loadAbonnements();
          this.closeModal();
        },
        error: (err) => console.error('Error creating abonnement:', err)
      });
    }
  }

  toggleStatut(abonnement: Abonnement) {
    const newStatut = abonnement.statut === 'Actif' ? 'Inactif' : 'Actif';
    this.abonnementService.updateStatut(abonnement.id_abonnement!, newStatut).subscribe({
      next: () => this.loadAbonnements(),
      error: (err) => console.error('Error updating status:', err)
    });
  }

  deleteAbonnement(id: number) {
    if (confirm('Are you sure you want to delete this subscription?')) {
      this.abonnementService.deleteAbonnement(id).subscribe({
        next: () => this.loadAbonnements(),
        error: (err) => console.error('Error deleting abonnement:', err)
      });
    }
  }

  getEmptyAbonnement(): Abonnement {
    return {
      nom: '',
      description: '',
      prix: 0,
      duree_jours: 30,
      niveau_acces: 'Basic',
      acces_illimite: false,
      support_prioritaire: false,
      statut: 'Actif'
    };
  }
}
