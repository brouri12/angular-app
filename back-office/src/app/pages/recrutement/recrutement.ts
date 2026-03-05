import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  ngOnInit() {
    this.loadOffres();
  }

  loadOffres() {
    this.loading = true;
    this.cdr.detectChanges();
    this.recrutementService.getAllOffres().subscribe({
      next: (data) => {
        this.offres = data;
        this.loading = false;
        this.cdr.detectChanges();
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

    // Check if file is selected
    if (!this.selectedFile) {
      this.error = 'Veuillez sélectionner un fichier CV';
      this.cdr.detectChanges();
      return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1]; // Remove data:application/pdf;base64, prefix
      
      const candidatureToCreate = {
        ...this.newCandidature,
        date_candidature: new Date().toISOString().split('T')[0],
        cv_pdf: base64String,
        cv_filename: this.selectedFile!.name,
        cv_content_type: this.selectedFile!.type
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
          console.error('Erreur complète:', err);
          console.error('Error status:', err.status);
          console.error('Error error:', err.error);
          console.error('Error type:', typeof err.error);
          console.error('Error stringified:', JSON.stringify(err.error));
          
          // Display the actual error message from backend
          if (err.error && err.error.errors && typeof err.error.errors === 'object') {
            // Validation errors from backend
            const errors = Object.entries(err.error.errors)
              .map(([field, message]) => `• ${field}: ${message}`)
              .join('\n');
            this.error = `Erreur de validation:\n\n${errors}`;
          } else if (err.error && typeof err.error === 'string') {
            this.error = err.error;
          } else if (err.error && err.error.message) {
            this.error = err.error.message;
          } else if (err.error && err.error.error) {
            this.error = err.error.error;
          } else if (err.status === 409) {
            this.error = 'Erreur 409: Conflit - Vérifiez que l\'email est unique et que le fichier n\'est pas trop volumineux.';
          } else if (err.status === 400) {
            this.error = `Erreur 400: Requête invalide. Vérifiez les logs de la console (F12) pour plus de détails.`;
          } else {
            this.error = `Erreur ${err.status}: ${err.statusText || 'Erreur lors de la candidature'}`;
          }
          this.cdr.detectChanges();
        }
      });
    };

    reader.onerror = () => {
      this.error = 'Erreur lors de la lecture du fichier';
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(this.selectedFile);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size (700KB max - will be ~950KB after Base64 encoding)
      const maxSize = 700 * 1024; // 700KB in bytes
      if (file.size > maxSize) {
        this.error = 'Le fichier est trop volumineux. Taille maximale: 700KB (le fichier sera encodé et deviendra plus gros). Veuillez compresser votre PDF davantage.';
        this.selectedFile = null;
        this.selectedFileName = '';
        input.value = '';
        this.cdr.detectChanges();
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Format de fichier non valide. Utilisez PDF, DOC ou DOCX';
        this.selectedFile = null;
        this.selectedFileName = '';
        input.value = '';
        this.cdr.detectChanges();
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.error = '';
      this.cdr.detectChanges();
    }
  }

  downloadCV(candidature: CandidatureEnseignant) {
    if (!candidature.cv_pdf) {
      this.error = 'Aucun CV disponible pour cette candidature';
      this.cdr.detectChanges();
      return;
    }

    try {
      // Convert Base64 to Blob
      const byteCharacters = atob(candidature.cv_pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: candidature.cv_content_type || 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = candidature.cv_filename || `CV_${candidature.nom_candidat}_${candidature.prenom_candidat}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du CV:', error);
      this.error = 'Erreur lors du téléchargement du CV';
      this.cdr.detectChanges();
    }
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
}
