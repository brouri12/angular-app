import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';

import { MemberService } from '../../services/member.service';
import { ClubService, Club } from '../../services/club.service';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, RouterModule, JoinConfirmModalComponent],
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.css']
})
export class MyRegistrationsComponent implements OnInit {

  // ===== Reservations =====
  loading = false;
  errorMsg = '';
  myRegs: any[] = [];

  confirmOpen = false;
  selectedRegId: number | null = null;

  // ===== Clubs =====
  loadingClubs = false;
  myClubs: Club[] = [];
  myClubIds = new Set<number>();

  // clubId -> memberId
  private memberIdByClubId = new Map<number, number>();

  confirmClubOpen = false;
  selectedClubId: number | null = null;

  // ===== Badge =====
  badgeLoadingClubId: number | null = null;
  badgeMsg = '';

  constructor(
    private registrationService: RegistrationService,
    private authService: AuthService,
    private memberService: MemberService,
    public clubService: ClubService
  ) {}

  ngOnInit(): void {
    this.loadMyRegistrations();
    this.loadMyClubs();
  }

  // ==========================
  // RESERVATIONS
  // ==========================
  loadMyRegistrations() {
    const cachedUser = this.authService.getCurrentUserValue();
    const idUser = Number((cachedUser as any)?.id_user);
    if (!idUser) return;

    this.loading = true;
    this.errorMsg = '';

    this.registrationService.getRegistrationsByUserId(idUser).subscribe({
      next: (data: any[]) => {
        this.myRegs = data || [];

        // Fill eventTitle for each registration
        this.myRegs.forEach(r => {
          const eventId = Number(r?.eventId);
          if (!eventId) return;

          this.registrationService.getEventById(eventId).subscribe({
            next: (ev: any) => {
              r.eventTitle =
                ev?.title ??
                ev?.nomEvent ??
                ev?.nom ??
                ev?.name ??
                (`Event #${eventId}`);
            },
            error: () => {
              r.eventTitle = `Event #${eventId}`;
            }
          });
        });

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.message || 'Erreur lors du chargement des réservations';
      }
    });
  }

  openDeleteModal(id: number) {
    this.selectedRegId = id;
    this.confirmOpen = true;
  }

  confirmDelete() {
    if (!this.selectedRegId) return;

    this.registrationService.deleteRegistration(this.selectedRegId).subscribe({
      next: () => {
        this.myRegs = this.myRegs.filter(r => r.idRegistration !== this.selectedRegId);
        this.confirmOpen = false;
        this.selectedRegId = null;
      },
      error: () => {
        this.confirmOpen = false;
        this.selectedRegId = null;
      }
    });
  }

  cancelDelete() {
    this.confirmOpen = false;
    this.selectedRegId = null;
  }

  // ==========================
  // CLUBS
  // ==========================
  loadMyClubs() {
    const cachedUser = this.authService.getCurrentUserValue();
    const idUser = Number((cachedUser as any)?.id_user);
    if (!idUser) return;

    this.loadingClubs = true;
    this.errorMsg = '';

    this.memberService.getByUser(idUser).subscribe({
      next: (memberships: any[]) => {
        this.myClubIds.clear();
        this.memberIdByClubId.clear();

        (memberships || []).forEach(m => {
          const idClub = Number(m?.idClub);
          const idMember = Number(m?.idMember);
          if (idClub) this.myClubIds.add(idClub);
          if (idClub && idMember) this.memberIdByClubId.set(idClub, idMember);
        });

        this.clubService.getAll().subscribe({
          next: (clubs: Club[]) => {
            const all = (clubs || []).map(c => this.normalizeClub(c));
            this.myClubs = all.filter(c => this.myClubIds.has(Number((c as any)?.idClub)));
            this.loadingClubs = false;
          },
          error: () => {
            this.myClubs = [];
            this.loadingClubs = false;
          }
        });
      },
      error: () => {
        this.myClubs = [];
        this.loadingClubs = false;
      }
    });
  }

  private normalizeClub(c: any): Club {
    return {
      ...c,
      dateCreation: c?.dateCreation ?? c?.date_creation ?? null
    };
  }

  openLeaveClubModal(idClub: number) {
    this.selectedClubId = Number(idClub);
    this.confirmClubOpen = true;
  }

  confirmLeaveClub() {
    const clubId = this.selectedClubId;
    if (!clubId) return;

    const memberId = this.memberIdByClubId.get(clubId);
    if (!memberId) {
      this.errorMsg = "Impossible de quitter: idMember introuvable pour ce club.";
      this.confirmClubOpen = false;
      this.selectedClubId = null;
      return;
    }

    this.loadingClubs = true;

    this.memberService.delete(memberId).subscribe({
      next: () => {
        this.myClubs = this.myClubs.filter(c => Number((c as any).idClub) !== clubId);
        this.myClubIds.delete(clubId);
        this.memberIdByClubId.delete(clubId);

        this.loadingClubs = false;
        this.confirmClubOpen = false;
        this.selectedClubId = null;
      },
      error: (err) => {
        this.loadingClubs = false;
        this.errorMsg = err?.error || "Erreur lors du leave du club.";
        this.confirmClubOpen = false;
        this.selectedClubId = null;
      }
    });
  }

  cancelLeaveClub() {
    this.confirmClubOpen = false;
    this.selectedClubId = null;
  }

  // ==========================
  // BADGE
  // ==========================
  isBadgeLoading(idClub?: number): boolean {
    return this.badgeLoadingClubId === Number(idClub);
  }

  getBadgeForClub(club: Club) {
    this.errorMsg = '';
    this.badgeMsg = '';

    const clubId = Number((club as any)?.idClub);
    if (!clubId) {
      this.errorMsg = 'Club invalide';
      return;
    }

    const cachedUser = this.authService.getCurrentUserValue();
    const idUser = Number((cachedUser as any)?.id_user);

    if (!idUser) {
      this.errorMsg = 'Utilisateur non connecté';
      return;
    }

    this.badgeLoadingClubId = clubId;

    this.memberService.sendBadge(idUser, clubId).subscribe({
      next: (msg: string) => {
        this.badgeMsg = msg || 'Badge envoyé par email ✅';
        this.badgeLoadingClubId = null;
      },
      error: (err) => {
        this.badgeLoadingClubId = null;
        const msg =
          (typeof err?.error === 'string' ? err.error : '') ||
          err?.message ||
          'Erreur envoi badge';
        this.errorMsg = msg;
      }
    });
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400x200';
  }
}