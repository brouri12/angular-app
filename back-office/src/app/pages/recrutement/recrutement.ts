import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RecrutementService } from '../../services/recrutement.service';
import { OffreRecrutement, CandidatureEnseignant } from '../../models/recrutement.model';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-recrutement',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './recrutement.html',
  styleUrls: ['./recrutement.css']
})
export class RecrutementComponent implements OnInit {
  private recrutementService = inject(RecrutementService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  offres: OffreRecrutement[] = [];
  selectedOffre: OffreRecrutement | null = null;
  editingOffre: OffreRecrutement | null = null;
  candidatures: CandidatureEnseignant[] = [];
  loading = false;
  error = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';
  successMessage = '';

  newOffre: OffreRecrutement = this.initNewOffre();
  newCandidature: CandidatureEnseignant = this.initNewCandidature();
  showOffreForm = false;
  showCandidatureForm = false;
  showDuplicateModal = false;
  duplicateMessage = '';
  showReaffectationModal = false;
  offreCompatible: OffreRecrutement | null = null;
  offresDisponibles: OffreRecrutement[] = [];
  offreSelectionnee: OffreRecrutement | null = null;
  reaffectationCandidature: CandidatureEnseignant | null = null;

  ngOnInit() {
    this.loadOffres();
    // Subscribe to queryParams so it works even when already on this page
    this.route.queryParamMap.subscribe(params => {
      const offreId = params.get('offreId');
      if (offreId && this.offres.length > 0) {
        this.autoSelectOffre(+offreId);
      } else if (offreId) {
        // Store for after offres load
        (this as any)._pendingOffreId = +offreId;
      }
    });
  }

  private autoSelectOffre(offreId: number) {
    const offre = this.offres.find(o => o.id === offreId);
    if (offre) {
      this.selectOffre(offre);
      setTimeout(() => {
        const el = document.getElementById('candidatures-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }

  loadOffres() {
    this.loading = true;
    this.cdr.detectChanges();
    this.recrutementService.getAllOffres().subscribe({
      next: (data) => {
        this.offres = data;
        this.loading = false;
        this.cdr.detectChanges();

        // Auto-select offer from notification query param
        const offreId = this.route.snapshot.queryParamMap.get('offreId');
        if (offreId) {
          const offre = this.offres.find(o => o.id === +offreId);
          if (offre) {
            this.selectOffre(offre);
            // Scroll to candidatures section after a short delay
            setTimeout(() => {
              const el = document.getElementById('candidatures-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
          }
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des offres';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  selectOffre(offre: OffreRecrutement) {
    this.selectedOffre = offre;
    this.loadCandidatures(offre.id!);
    this.cdr.detectChanges();
  }

  loadCandidatures(offreId: number) {
    this.recrutementService.getCandidaturesByOffre(offreId).subscribe({
      next: (data) => {
        this.candidatures = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des candidatures';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  createOffre() {
    if (this.editingOffre) {
      // Update existing offre
      const offreToUpdate = {
        ...this.newOffre,
        id: this.editingOffre.id
      };
      
      this.recrutementService.updateOffre(this.editingOffre.id!, offreToUpdate).subscribe({
        next: (offre) => {
          const index = this.offres.findIndex(o => o.id === offre.id);
          if (index !== -1) {
            this.offres[index] = offre;
          }
          this.showOffreForm = false;
          this.editingOffre = null;
          this.newOffre = this.initNewOffre();
          this.error = '';
          this.successMessage = '✅ Offre mise à jour avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur complète:', err);
          if (err.error && err.error.errors) {
            const errors = Object.entries(err.error.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join('\n');
            this.error = `Erreur de validation:\n${errors}`;
          } else if (err.error && err.error.message) {
            this.error = err.error.message;
          } else {
            this.error = 'Erreur lors de la mise à jour de l\'offre';
          }
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new offre
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
          this.successMessage = '✅ Offre créée avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur complète:', err);
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
          this.cdr.detectChanges();
        }
      });
    }
  }

  openUpdateForm(offre: OffreRecrutement) {
    this.editingOffre = offre;
    this.newOffre = { ...offre };
    this.showOffreForm = true;
    this.cdr.detectChanges();
  }

  postuler() {
    if (!this.selectedOffre?.id) return;

    const envoyer = (cvBase64?: string, cvFilename?: string, cvContentType?: string) => {
      const candidatureToCreate = {
        ...this.newCandidature,
        date_candidature: new Date().toISOString().split('T')[0],
        ...(cvBase64 && { cv_pdf: cvBase64, cv_filename: cvFilename, cv_content_type: cvContentType })
      };

      this.recrutementService.postuler(this.selectedOffre!.id!, candidatureToCreate).subscribe({
        next: (candidature) => {
          this.candidatures.push(candidature);
          this.showCandidatureForm = false;
          this.newCandidature = this.initNewCandidature();
          this.selectedFile = null;
          this.selectedFileName = '';
          this.error = '';
          this.successMessage = '✅ Candidature envoyée avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = '';
          if (err.status === 409) {
            // Back-office has no interceptor — err.error is the raw backend string
            const msg = typeof err.error === 'string'
              ? err.error
              : (err as any).customMessage
              || 'Vous avez déjà postulé à cette offre.';
            this.duplicateMessage = msg;
            this.showDuplicateModal = true;
          } else {
            this.error = typeof err.error === 'string'
              ? err.error
              : `Erreur ${err.status}: Erreur lors de la candidature`;
          }
          this.cdr.detectChanges();
        }
      });
    };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        envoyer(base64, this.selectedFile!.name, this.selectedFile!.type);
      };
      reader.onerror = () => {
        this.error = 'Erreur lors de la lecture du fichier';
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      envoyer();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.error = '';
      this.cdr.detectChanges();
    }
  }

  downloadCV(candidature: CandidatureEnseignant) {
    if (!candidature.id_candidature) {
      this.error = 'ID candidature introuvable';
      this.cdr.detectChanges();
      return;
    }

    this.recrutementService.downloadCV(candidature.id_candidature).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = candidature.cv_filename || `CV_${candidature.nom_candidat}_${candidature.prenom_candidat}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.error = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.status === 404 ? 'Aucun CV disponible pour cette candidature' : 'Erreur lors du téléchargement du CV';
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du changement de statut';
        this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la fermeture';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  rouvrirOffre(id: number) {
    this.recrutementService.rouvrirOffre(id).subscribe({
      next: (offre) => {
        const index = this.offres.findIndex(o => o.id === id);
        if (index !== -1) {
          this.offres[index] = offre;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la réouverture';
        this.cdr.detectChanges();
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
      lettre_motivation: '',
      statut: 'EN_ATTENTE'
    };
  }

  rechercherOffreCompatible(candidature: CandidatureEnseignant) {
    if (!candidature.id_candidature) return;
    this.reaffectationCandidature = candidature;
    this.offreCompatible = null;
    this.offresDisponibles = [];
    this.offreSelectionnee = null;

    // Load all open offers for manual selection
    this.recrutementService.getOffresByStatut('OUVERTE').subscribe({
      next: (offres) => {
        // Exclude the current offer
        this.offresDisponibles = offres.filter(o => o.id !== this.selectedOffre?.id);
        this.showReaffectationModal = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.showReaffectationModal = true;
        this.cdr.detectChanges();
      }
    });
  }

  confirmerReaffectation() {
    if (!this.reaffectationCandidature || !this.offreSelectionnee) return;

    const nouvelleCandidature: CandidatureEnseignant = {
      nom_candidat: this.reaffectationCandidature.nom_candidat,
      prenom_candidat: this.reaffectationCandidature.prenom_candidat,
      email: this.reaffectationCandidature.email,
      lettre_motivation: this.reaffectationCandidature.lettre_motivation,
      statut: 'EN_ATTENTE'
    };

    this.recrutementService.postuler(this.offreSelectionnee.id!, nouvelleCandidature).subscribe({
      next: () => {
        this.showReaffectationModal = false;
        this.successMessage = `✅ ${this.reaffectationCandidature?.nom_candidat} réaffecté(e) à "${this.offreSelectionnee?.titre}" avec succès !`;
        setTimeout(() => this.successMessage = '', 5000);
        this.loadOffres();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showReaffectationModal = false;
        this.error = typeof err.error === 'string' ? err.error : 'Erreur lors de la réaffectation';
        this.cdr.detectChanges();
      }
    });
  }
}
