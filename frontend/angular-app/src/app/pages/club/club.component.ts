import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { Club, ClubService } from '../../services/club.service';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';

import { Member } from '../../models/member.model';
import { User } from '../../models/user.model';

import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, JoinConfirmModalComponent],
  templateUrl: './club.component.html',
  styleUrl: './club.component.css'
})
export class ClubComponent implements OnInit {

  clubs: Club[] = [];
  currentUser: User | null = null;

  // popup
  isConfirmOpen = false;
  selectedClub: Club | null = null;

  // messages
  errorMsg = '';
  successMsg = '';

  // loading only for clicked club
  loadingClubId: number | null = null;

  // clubs already joined
  joinedClubIds = new Set<number>();
  // statut par club (PENDING / ACCEPTED / DENIED)
  memberStatusByClub: { [clubId: number]: string } = {};
  /** Rôle membre par club (RECRUE / PRESIDENT) */
  memberRoleByClub: { [clubId: number]: string } = {};

  // ✅ Translation state per club - cache par langue
  translationCache: { [clubId: number]: { fr?: string; ar?: string } } = {};
  translatingClubId: number | null = null;
  activeLang: { [clubId: number]: 'original' | 'fr' | 'ar' } = {};

  constructor(
    public clubService: ClubService,
    private memberService: MemberService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // 🔥 Important: attendre que le user soit chargé puis charger clubs
    // sinon tu risques de faire GET /clubs sans token (selon timing)
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;

      const idUser = Number((user as any)?.id_user);
      if (idUser) {
        this.loadMyMemberships(idUser);
      } else {
        this.joinedClubIds.clear();
      }
    });

    if (!this.authService.getCurrentUserValue() && this.authService.isAuthenticated()) {
      this.authService.loadUser();
    }

    // Charger les clubs maintenant (token dans ClubService)
    this.loadClubs();
  }

  // =========================
  // LOAD DATA
  // =========================
  loadClubs() {
    this.clubService.getAll().subscribe({
      next: (data: any[]) => {
        this.clubs = (data || []).map(c => ({
          ...c,
          dateCreation: c?.dateCreation ?? c?.date_creation ?? null
        }));
      },
      error: (err) => {
        console.error(err);
        this.errorMsg =
          err?.error?.message ||
          err?.message ||
          'Erreur chargement clubs (401/CORS). Vérifie gateway/backend.';
      }
    });
  }

  loadMyMemberships(idUser: number) {
    this.memberService.getByUser(idUser).subscribe({
      next: (rows) => {
        this.joinedClubIds.clear();
        this.memberStatusByClub = {};
        this.memberRoleByClub = {};
        (rows || []).forEach(m => {
          const clubId = Number((m as any)?.idClub);
          if (clubId) {
            this.joinedClubIds.add(clubId);
            this.memberStatusByClub[clubId] = (m as any)?.status || 'PENDING';
            this.memberRoleByClub[clubId] = (m as any)?.role || 'RECRUE';
          }
        });
      },
      error: () => {
        this.joinedClubIds.clear();
        this.memberStatusByClub = {};
        this.memberRoleByClub = {};
      }
    });
  }

  isJoined(idClub?: number): boolean {
    if (!idClub) return false;
    return this.joinedClubIds.has(Number(idClub));
  }

  isLoadingClub(idClub?: number): boolean {
    return this.loadingClubId === Number(idClub);
  }

  // =========================
  // JOIN FLOW
  // =========================
  joinAndOpen(club: Club) {
    this.errorMsg = '';
    this.successMsg = '';

    const user = this.authService.getCurrentUserValue();
    const idUser = Number((user as any)?.id_user);

    if (!idUser) {
      this.errorMsg = 'Utilisateur non connecté';
      return;
    }

    if (!club?.idClub) {
      this.errorMsg = 'Club invalide';
      return;
    }

    if (this.isJoined(club.idClub)) {
      return;
    }

    this.selectedClub = club;
    this.isConfirmOpen = true;
  }

  cancelJoinConfirm() {
    this.isConfirmOpen = false;
    this.selectedClub = null;
  }

  confirmJoin() {
    const idClub = Number(this.selectedClub?.idClub);
    if (!idClub) return;

    this.errorMsg = '';
    this.successMsg = '';
    this.loadingClubId = idClub;

    const doJoin = (user: any) => {
      const idUser = Number(user?.id_user);

      if (!idUser) {
        this.loadingClubId = null;
        this.errorMsg = 'userId introuvable';
        this.cancelJoinConfirm();
        return;
      }

      if (!user.nom || !user.prenom || !user.email || !user.telephone) {
        this.loadingClubId = null;
        this.errorMsg = 'Votre profil est incomplet. Veuillez le compléter.';
        this.cancelJoinConfirm();
        return;
      }

      const payload: Member = {
        idUser: idUser,
        idClub: idClub,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        niveauAnglais: user.niveauAnglais || 'B2'
      };

      this.memberService.create(payload).subscribe({
        next: () => {
          this.successMsg = 'Inscription créée ✅';
          this.joinedClubIds.add(idClub);
          this.loadingClubId = null;
          this.cancelJoinConfirm();
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            (typeof err?.error === 'string' ? err.error : '') ||
            err?.message ||
            'Erreur inscription';

          const normalized = (msg || '').toLowerCase();
          if (normalized.includes('déjà') || normalized.includes('already') || normalized.includes('exists')) {
            this.joinedClubIds.add(idClub);
            this.loadingClubId = null;
            this.cancelJoinConfirm();
            return;
          }

          this.errorMsg = msg;
          this.loadingClubId = null;
          this.cancelJoinConfirm();
        }
      });
    };

    const cachedUser = this.authService.getCurrentUserValue();
    if (cachedUser) {
      doJoin(cachedUser);
      return;
    }

    this.authService.getCurrentUser().subscribe({
      next: (user) => doJoin(user),
      error: () => {
        this.loadingClubId = null;
        this.errorMsg = 'Utilisateur non connecté';
        this.cancelJoinConfirm();
      }
    });
  }

  // =========================
  // TRANSLATION
  // =========================
  translate(club: Club, targetLang: 'fr' | 'ar') {
    const id = club.idClub!;

    // Toggle : si déjà actif → revenir à l'original
    if (this.activeLang[id] === targetLang) {
      this.activeLang[id] = 'original';
      return;
    }

    // ✅ Déjà en cache → afficher directement sans appel API
    if (this.translationCache[id]?.[targetLang]) {
      this.activeLang[id] = targetLang;
      return;
    }

    // Sinon appel API
    this.doTranslate(id, club.description || '', targetLang);
  }

  private doTranslate(clubId: number, text: string, targetLang: 'fr' | 'ar') {
    if (!text.trim()) return;

    this.translatingClubId = clubId;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        const translated = res?.[0]?.map((c: any[]) => c?.[0] || '').join('') || text;

        // ✅ Stocker dans le cache
        if (!this.translationCache[clubId]) this.translationCache[clubId] = {};
        this.translationCache[clubId][targetLang] = translated;

        this.activeLang[clubId] = targetLang;
        this.translatingClubId = null;
      },
      error: () => {
        this.translatingClubId = null;
      }
    });
  }

  getDescription(club: Club): string {
    const id = club.idClub!;
    const lang = this.activeLang[id];
    if (lang && lang !== 'original') {
      return this.translationCache[id]?.[lang] || club.description || '';
    }
    return club.description || 'No description available';
  }

  isTranslating(clubId: number): boolean {
    return this.translatingClubId === clubId;
  }

  // =========================
  // UI HELPERS
  // =========================
  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400x200';
  }

  badgeType(type?: string) {
    switch ((type || '').toUpperCase()) {
      case 'ONLINE': return 'badge-orange';
      case 'PRESENTIEL': return 'badge-blue';
      default: return 'badge-gray';
    }
  }

  badgeCity(ville?: string) {
    return ville ? 'badge-purple' : 'badge-gray';
  }
}