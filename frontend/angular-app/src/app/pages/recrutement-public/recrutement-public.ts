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
      
      // Validate file size (700KB max)
      const maxSize = 700 * 1024;
      if (file.size > maxSize) {
        this.notificationService.error('Le fichier est trop volumineux. Taille maximale: 700KB');
        this.selectedFile = null;
        this.selectedFileName = '';
        input.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.error('Format de fichier non valide. Utilisez PDF, DOC ou DOCX');
        this.selectedFile = null;
        this.selectedFileName = '';
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.cdr.detectChanges();
    }
  }

  postuler() {
    if (!this.selectedOffre?.id) return;

    if (!this.selectedFile) {
      this.notificationService.error('Veuillez sélectionner un fichier CV');
      return;
    }

    // Afficher le modal de traitement
    this.showProcessingModal = true;
    this.showCandidatureForm = false;
    this.loading = true;

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      
      const candidatureToCreate = {
        ...this.newCandidature,
        date_candidature: new Date().toISOString().split('T')[0],
        cv_pdf: base64String,
        cv_filename: this.selectedFile!.name,
        cv_content_type: this.selectedFile!.type
      };

      console.log('📤 Envoi de la candidature:', {
        nom: candidatureToCreate.nom_candidat,
        prenom: candidatureToCreate.prenom_candidat,
        email: candidatureToCreate.email,
        cv_filename: candidatureToCreate.cv_filename,
        cv_size: base64String.length,
        lettre_motivation_length: candidatureToCreate.lettre_motivation?.length || 0,
        date_candidature: candidatureToCreate.date_candidature,
        statut: candidatureToCreate.statut
      });
      console.log('📦 Objet complet:', candidatureToCreate);

      // Envoyer la candidature en arrière-plan
      this.recrutementService.postuler(this.selectedOffre!.id!, candidatureToCreate).subscribe({
        next: (response) => {
          console.log('✅ Candidature envoyée avec succès:', response);
        },
        error: (err: any) => {
          console.error('❌ Erreur lors de l\'envoi:', err);
        }
      });

      // Afficher le modal de traitement pendant 2 secondes puis rediriger
      setTimeout(() => {
        console.log('🔄 Fermeture du modal et redirection vers la page d\'accueil...');
        this.showProcessingModal = false;
        this.notificationService.success('✅ Votre candidature est en cours de traitement !', 5000);
        this.newCandidature = this.initNewCandidature();
        this.selectedFile = null;
        this.selectedFileName = '';
        this.loading = false;
        this.cdr.detectChanges();
        
        // Redirection vers la page d'accueil
        setTimeout(() => {
          console.log('🏠 Redirection vers la page d\'accueil...');
          this.router.navigateByUrl('/').then(
            () => console.log('✅ Redirection réussie'),
            (error) => console.error('❌ Erreur de redirection:', error)
          );
        }, 500);
      }, 2000);
    };

    reader.onerror = () => {
      this.showProcessingModal = false;
      this.notificationService.error('Erreur lors de la lecture du fichier');
      this.loading = false;
      this.cdr.detectChanges();
    };

    reader.readAsDataURL(this.selectedFile);
  }

  isDateExpired(date: Date): boolean {
    return new Date(date) < new Date();
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
