import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { Club, ClubType } from './../../models/club.model';
import { ClubService } from './../../services/club.service';
import { ClubsRefreshService } from '../../services/clubs-refresh.service';

// ✅ modal (comme reservations)
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, JoinConfirmModalComponent],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css'],
})
export class ClubsComponent implements OnInit {

  clubs: Club[] = [];
  filtered: Club[] = [];

  loading = false;
  loadingAction = false;
  errorMsg = '';

  searchText = '';
  typeFilter: '' | ClubType = '';
  villeFilter = '';

  /** Statistiques (calculées côté client, comme agrégation Events) */
  totalClubs = 0;
  byType: { label: string; total: number }[] = [];
  distinctVillesCount = 0;
  withLocationCount = 0;

  // ✅ MODAL DELETE (même logique que reservations)
  confirmOpen = false;
  selectedClub: Club | null = null;

  constructor(
    private clubService: ClubService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: ClubsRefreshService
  ) {}

  ngOnInit(): void {
    this.loadAll();

    // ✅ refresh auto après create/update (modal)
    this.refreshService.refresh$.subscribe(() => {
      this.loadAll();
    });
  }

  loadAll() {
    this.loading = true;
    this.errorMsg = '';

    this.clubService.getAll().subscribe({
      next: (data) => {
        this.clubs = data || [];
        this.rebuildStats();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = typeof err?.error === 'string'
          ? err.error
          : (err?.message || 'Erreur GET clubs');
      }
    });
  }

  applyFilters() {
    const txt = (this.searchText || '').toLowerCase().trim();
    const type = (this.typeFilter || '').toUpperCase().trim();

    this.filtered = (this.clubs || []).filter(c => {
      if (type && (c.type || '').toUpperCase() !== type) return false;
      if (this.villeFilter && (c.ville || '').trim() !== this.villeFilter) return false;
      if (!txt) return true;
      return (c.nomClub || '').toLowerCase().includes(txt);
    });
  }

  private rebuildStats(): void {
    const list = this.clubs || [];
    this.totalClubs = list.length;

    const typeMap = new Map<string, number>();
    for (const c of list) {
      const t = String(c.type || '—').toUpperCase();
      typeMap.set(t, (typeMap.get(t) || 0) + 1);
    }
    this.byType = Array.from(typeMap.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const villes = new Set(
      list.map(c => (c.ville || '').trim()).filter(v => v.length > 0),
    );
    this.distinctVillesCount = villes.size;
    this.withLocationCount = list.filter(c => (c.ville || '').trim().length > 0).length;
  }

  resetFilters() {
    this.searchText = '';
    this.typeFilter = '';
    this.villeFilter = '';
    this.applyFilters();
  }

  // ✅ OUVRIR CREATE (overlay)
  openCreate() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  // ✅ OUVRIR EDIT (overlay)
  openEdit(c: Club) {
    if (!c.idClub) return;
    this.router.navigate([c.idClub, 'edit'], { relativeTo: this.route });
  }

  // ✅ OUVRIR MODAL DELETE
  openDeleteModal(c: Club) {
    this.selectedClub = c;
    this.confirmOpen = true;
  }

  // ✅ CONFIRMER DELETE
  confirmDelete() {
    if (!this.selectedClub?.idClub) return;

    this.loadingAction = true;
    this.errorMsg = '';

    this.clubService.delete(this.selectedClub.idClub).subscribe({
      next: () => {
        this.loadingAction = false;

        // retirer du tableau local + refresh filtrage
        const id = this.selectedClub!.idClub!;
        this.clubs = this.clubs.filter(x => x.idClub !== id);
        this.rebuildStats();
        this.applyFilters();

        // fermer modal
        this.confirmOpen = false;
        this.selectedClub = null;
      },
      error: (err) => {
        this.loadingAction = false;
        this.errorMsg = err?.error || 'Erreur delete';

        // fermer modal (optionnel : tu peux le laisser ouvert)
        this.confirmOpen = false;
        this.selectedClub = null;
      }
    });
  }

  // ✅ ANNULER DELETE
  cancelDelete() {
    this.confirmOpen = false;
    this.selectedClub = null;
  }

  logoUrl(id?: number) {
    if (!id) return 'https://via.placeholder.com/800x400?text=No+Logo';
    return this.clubService.logoUrl(id);
  }

  get uniqueVilles(): string[] {
    const villes = (this.clubs || [])
      .map(c => (c.ville || '').trim())
      .filter(v => !!v);
    return Array.from(new Set(villes)).sort();
  }
}