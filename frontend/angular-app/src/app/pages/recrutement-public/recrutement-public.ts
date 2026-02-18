import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecrutementService } from '../../services/recrutement.service';
import { NotificationService } from '../../services/notification.service';
import { OffreRecrutement, CandidatureEnseignant } from '../../models/recrutement.model';

@Component({
  selector: 'app-recrutement-public',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recrutement-public.html',
  styleUrls: ['./recrutement-public.css']
})
export class RecrutementPublicComponent implements OnInit {
  private recrutementService = inject(RecrutementService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  offres: OffreRecrutement[] = [];
  selectedOffre: OffreRecrutement | null = null;
  loading = true;
  filterSpecialite = '';

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
    this.showCandidatureForm = false;
  }

  postuler() {
    if (!this.selectedOffre?.id) return;

    this.loading = true;
    this.recrutementService.postuler(this.selectedOffre.id, this.newCandidature).subscribe({
      next: () => {
        this.notificationService.success('Votre candidature a été envoyée avec succès !');
        this.showCandidatureForm = false;
        this.newCandidature = this.initNewCandidature();
        this.loading = false;
      },
      error: (err: any) => {
        this.notificationService.error(err.customMessage || 'Erreur lors de l\'envoi de la candidature');
        this.loading = false;
        console.error(err);
      }
    });
  }

  isDateExpired(date: Date): boolean {
    return new Date(date) < new Date();
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
