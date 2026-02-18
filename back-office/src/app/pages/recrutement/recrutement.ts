import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../services/recrutement.service';
import { OffreRecrutement, CandidatureEnseignant } from '../../models/recrutement.model';

@Component({
  selector: 'app-recrutement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recrutement.html',
  styleUrls: ['./recrutement.css']
})
export class RecrutementComponent implements OnInit {
  private recrutementService = inject(RecrutementService);

  offres: OffreRecrutement[] = [];
  selectedOffre: OffreRecrutement | null = null;
  candidatures: CandidatureEnseignant[] = [];
  loading = false;
  error = '';

  newOffre: OffreRecrutement = this.initNewOffre();
  newCandidature: CandidatureEnseignant = this.initNewCandidature();
  showOffreForm = false;
  showCandidatureForm = false;

  ngOnInit() {
    this.loadOffres();
  }

  loadOffres() {
    this.loading = true;
    this.recrutementService.getAllOffres().subscribe({
      next: (data) => {
        this.offres = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des offres';
        this.loading = false;
        console.error(err);
      }
    });
  }

  selectOffre(offre: OffreRecrutement) {
    this.selectedOffre = offre;
    this.loadCandidatures(offre.id!);
  }

  loadCandidatures(offreId: number) {
    this.recrutementService.getCandidaturesByOffre(offreId).subscribe({
      next: (data) => {
        this.candidatures = data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des candidatures';
        console.error(err);
      }
    });
  }

  createOffre() {
    // Ajouter la date de publication automatiquement
    const offreToCreate = {
      ...this.newOffre,
      date_publication: new Date().toISOString().split('T')[0]
    };
    
    this.recrutementService.createOffre(offreToCreate).subscribe({
      next: (offre) => {
        this.offres.push(offre);
        this.showOffreForm = false;
        this.newOffre = this.initNewOffre();
        this.error = '';
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        
        // Afficher les erreurs de validation du backend
        if (err.error && err.error.errors) {
          const errors = Object.entries(err.error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          this.error = `Erreur de validation:\n${errors}`;
        } else if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Erreur lors de la création de l\'offre';
        }
      }
    });
  }

  postuler() {
    if (!this.selectedOffre?.id) return;

    // Ajouter la date de candidature automatiquement
    const candidatureToCreate = {
      ...this.newCandidature,
      date_candidature: new Date().toISOString().split('T')[0]
    };

    this.recrutementService.postuler(this.selectedOffre.id, candidatureToCreate).subscribe({
      next: (candidature) => {
        this.candidatures.push(candidature);
        this.showCandidatureForm = false;
        this.newCandidature = this.initNewCandidature();
        this.error = '';
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        
        // Afficher les erreurs de validation du backend
        if (err.error && err.error.errors) {
          const errors = Object.entries(err.error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          this.error = `Erreur de validation:\n${errors}`;
        } else if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Erreur lors de la candidature';
        }
      }
    });
  }

  changerStatut(candidatureId: number, statut: string) {
    this.recrutementService.changerStatut(candidatureId, statut).subscribe({
      next: (candidature) => {
        const index = this.candidatures.findIndex(c => c.id_candidature === candidatureId);
        if (index !== -1) {
          this.candidatures[index] = candidature;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du changement de statut';
        console.error(err);
      }
    });
  }

  deleteOffre(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      this.recrutementService.deleteOffre(id).subscribe({
        next: () => {
          this.offres = this.offres.filter(o => o.id !== id);
          if (this.selectedOffre?.id === id) {
            this.selectedOffre = null;
            this.candidatures = [];
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error(err);
        }
      });
    }
  }

  fermerOffre(id: number) {
    this.recrutementService.fermerOffre(id).subscribe({
      next: (offre) => {
        const index = this.offres.findIndex(o => o.id === id);
        if (index !== -1) {
          this.offres[index] = offre;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de la fermeture';
        console.error(err);
      }
    });
  }

  private initNewOffre(): OffreRecrutement {
    return {
      titre: '',
      description: '',
      specialite: '',
      niveau_requis: '',
      type_contrat: 'CDI',
      experience_min: 0,
      date_limite: new Date(),
      statut: 'OUVERTE',
      nombre_postes: 1
    };
  }

  private initNewCandidature(): CandidatureEnseignant {
    return {
      nom_candidat: '',
      prenom_candidat: '',
      email: '',
      cv_url: '',
      lettre_motivation: '',
      statut: 'EN_ATTENTE'
    };
  }
}
