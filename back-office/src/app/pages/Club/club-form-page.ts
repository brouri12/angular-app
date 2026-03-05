import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Club, ClubType } from '../../models/club.model';
import { ClubService } from '../../services/club.service';
import { ClubsRefreshService } from '../../services/clubs-refresh.service';

// ✅ confirm modal
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

@Component({
  selector: 'app-club-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, JoinConfirmModalComponent],
  templateUrl: './club-form-page.html',
  styleUrls: ['./club-form-page.css'],
})
export class ClubFormPage implements OnInit {

  loadingAction = false;
  errorMsg = '';

  isEdit = false;
  idClub?: number;

  form: Club = {
    nomClub: '',
    description: '',
    type: 'ONLINE',
    ville: '',
  };

  selectedFile: File | null = null;

  types: ClubType[] = ['ONLINE', 'PRESENTIEL'];

  // ✅ CONFIRM CREATE/UPDATE
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: 'CREATE' | 'UPDATE' | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clubService: ClubService,
    private refreshService: ClubsRefreshService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;

    if (this.isEdit) {
      this.idClub = Number(id);

      this.clubService.getById(this.idClub).subscribe({
        next: (c) => {
          this.form = {
            idClub: c.idClub,
            nomClub: c.nomClub || '',
            description: c.description || '',
            type: (c.type as any) || 'ONLINE',
            ville: c.ville || '',
            dateCreation: c.dateCreation,
            logo: c.logo,
          };
        },
        error: () => (this.errorMsg = "Impossible de charger le club."),
      });
    }
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length ? input.files[0] : null;
  }

  close(withRefresh: boolean = false) {
    this.router.navigate(['../'], { relativeTo: this.route }).then(() => {
      if (withRefresh) this.refreshService.trigger();
    });
  }

  // =========================
  // ✅ CONFIRM FLOW
  // =========================
  openConfirmCreate() {
    this.errorMsg = '';
    this.pendingAction = 'CREATE';
    this.confirmTitle = 'Créer le club';
    this.confirmMessage =
      `Confirmer la création du club "${this.form.nomClub || ''}" ?`;
    this.confirmOpen = true;
  }

  openConfirmUpdate() {
    this.errorMsg = '';
    this.pendingAction = 'UPDATE';
    this.confirmTitle = 'Enregistrer les modifications';
    this.confirmMessage =
      `Confirmer la mise à jour du club #${this.idClub} "${this.form.nomClub || ''}" ?`;
    this.confirmOpen = true;
  }

  cancelAction() {
    this.confirmOpen = false;
    this.pendingAction = null;
  }

  confirmAction() {
    this.confirmOpen = false;

    if (this.pendingAction === 'CREATE') {
      this.pendingAction = null;
      this.create();
      return;
    }

    if (this.pendingAction === 'UPDATE') {
      this.pendingAction = null;
      this.update();
      return;
    }

    this.pendingAction = null;
  }

  // =========================
  // CREATE / UPDATE (unchanged logic)
  // =========================
  create() {
    this.loadingAction = true;
    this.errorMsg = '';

    this.clubService.create(this.form)
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: (created) => {
          // upload logo optionnel
          if (this.selectedFile && created?.idClub) {
            this.loadingAction = true;
            this.clubService.uploadLogo(created.idClub, this.selectedFile)
              .pipe(finalize(() => (this.loadingAction = false)))
              .subscribe({
                next: () => this.close(true),
                error: (err: any) => (this.errorMsg = err?.error || 'Erreur upload logo'),
              });
          } else {
            this.close(true);
          }
        },
        error: (err: any) => (this.errorMsg = err?.error || 'Erreur création club'),
      });
  }

  update() {
    if (!this.idClub) return;

    this.loadingAction = true;
    this.errorMsg = '';

    this.clubService.update(this.idClub, this.form)
      .pipe(finalize(() => (this.loadingAction = false)))
      .subscribe({
        next: () => {
          if (this.selectedFile) {
            this.loadingAction = true;
            this.clubService.uploadLogo(this.idClub!, this.selectedFile)
              .pipe(finalize(() => (this.loadingAction = false)))
              .subscribe({
                next: () => this.close(true),
                error: (err: any) => (this.errorMsg = err?.error || 'Erreur upload logo'),
              });
          } else {
            this.close(true);
          }
        },
        error: (err: any) => (this.errorMsg = err?.error || 'Erreur modification club'),
      });
  }
}