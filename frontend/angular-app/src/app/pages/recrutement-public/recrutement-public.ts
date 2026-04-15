import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecrutementService } from '../../services/recrutement.service';
import { NotificationService } from '../../services/notification.service';
import { OffreRecrutement, CandidatureEnseignant } from '../../models/recrutement.model';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-recrutement-public',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './recrutement-public.html',
  styleUrls: ['./recrutement-public.css']
})
export class RecrutementPublicComponent implements OnInit {
  private recrutementService = inject(RecrutementService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  offres: OffreRecrutement[] = [];
  selectedOffre: OffreRecrutement | null = null;
  editingOffre: OffreRecrutement | null = null;
  loading = true;
  filterSpecialite = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';
  showSuccessModal = false;
  showProcessingModal = false;
  submittedCandidature: any = null;
  showDuplicateModal = false;
  duplicateMessage = '';

  newCandidature: CandidatureEnseignant = this.initNewCandidature();
  showCandidatureForm = false;

  ngOnInit() {
    this.loadOffres();
  }

  loadOffres() {
    this.loading = true;
    console.log('🔍 Chargement des offres depuis:', `${this.recrutementService['apiUrl']}/offres/statut/OUVERTE`);
    this.recrutementService.getOffresByStatut('OUVERTE').subscribe({
      next: (data) => {
        console.log('✅ Offres reçues:', data);
        this.offres = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Erreur complète:', err);
        this.notificationService.error(err.customMessage || 'Erreur lors du chargement des offres');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterBySpecialite() {
    if (!this.filterSpecialite.trim()) {
      this.loadOffres();
      return;
    }

    this.loading = true;
    this.recrutementService.getOffresBySpecialite(this.filterSpecialite).subscribe({
      next: (data) => {
        this.offres = data.filter(o => o.statut === 'OUVERTE');
        this.loading = false;
        this.notificationService.info(`${this.offres.length} offre(s) trouvée(s)`);
      },
      error: (err: any) => {
        this.notificationService.error(err.customMessage || 'Erreur lors du filtrage');
        this.loading = false;
        console.error(err);
      }
    });
  }

  selectOffre(offre: OffreRecrutement) {
    this.selectedOffre = offre;
    this.showCandidatureForm = true;
    this.editingOffre = null;
    this.cdr.detectChanges();
  }

  openEditForm(offre: OffreRecrutement) {
    this.selectedOffre = offre;
    this.editingOffre = offre;
    this.newCandidature = { ...this.initNewCandidature() };
    this.showCandidatureForm = true;
    this.cdr.detectChanges();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.cdr.detectChanges();
    }
  }

  postuler() {
    if (!this.selectedOffre?.id) return;

    this.showProcessingModal = true;
    this.showCandidatureForm = false;
    this.loading = true;

    const envoyer = (cvBase64?: string, cvFilename?: string, cvContentType?: string) => {
      const candidatureToCreate = {
        ...this.newCandidature,
        date_candidature: new Date().toISOString().split('T')[0],
        ...(cvBase64 && { cv_pdf: cvBase64, cv_filename: cvFilename, cv_content_type: cvContentType })
      };

      this.recrutementService.postuler(this.selectedOffre!.id!, candidatureToCreate).subscribe({
        next: (response) => {
          console.log('✅ Candidature envoyée avec succès:', response);
          this.showProcessingModal = false;
          this.loading = false;
          this.notificationService.success('✅ Candidature envoyée avec succès !', 5000);
          this.newCandidature = this.initNewCandidature();
          this.selectedFile = null;
          this.selectedFileName = '';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigateByUrl('/'), 1000);
        },
        error: (err: any) => {
          this.showProcessingModal = false;
          this.loading = false;

          if (err.status === 409) {
            // Use customMessage from interceptor or fallback
            const message = err.customMessage
              || (typeof err.error === 'string' ? err.error : null)
              || 'Vous avez déjà postulé à cette offre.';
            this.showDuplicatePopup(message);
          } else {
            this.notificationService.error(err.customMessage || 'Erreur lors de l\'envoi', 7000);
            this.showCandidatureForm = true;
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
        this.showProcessingModal = false;
        this.loading = false;
        this.notificationService.error('Erreur lors de la lecture du fichier');
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      envoyer();
    }
  }

  isDateExpired(date: Date): boolean {
    return new Date(date) < new Date();
  }

  showDuplicatePopup(message: string) {
    this.duplicateMessage = message;
    this.showDuplicateModal = true;
    this.cdr.detectChanges();
  }

  closeSuccessModal() {
    console.log('🔄 Fermeture du modal de succès et redirection...');
    this.showSuccessModal = false;
    this.submittedCandidature = null;
    this.cdr.detectChanges();
    
    // Redirection vers la page d'accueil après 500ms
    setTimeout(() => {
      console.log('🏠 Redirection vers la page d\'accueil...');
      this.router.navigateByUrl('/').then(
        () => console.log('✅ Redirection réussie'),
        (error) => console.error('❌ Erreur de redirection:', error)
      );
    }, 500);
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
