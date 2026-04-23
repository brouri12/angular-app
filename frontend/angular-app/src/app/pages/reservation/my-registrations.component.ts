import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { JoinConfirmModalComponent } from '../../components/join-confirm-modal/join-confirm-modal.component';
import { ClubChatDockComponent } from '../../components/club-chat-dock/club-chat-dock.component';
import { SponsorModalComponent } from '../../components/sponsor-modal/sponsor-modal.component';

import { MemberService } from '../../services/member.service';
import { ClubService, Club } from '../../services/club.service';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, RouterModule, JoinConfirmModalComponent, ClubChatDockComponent, SponsorModalComponent],
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.css']
})
export class MyRegistrationsComponent implements OnInit, OnDestroy {

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
  // clubId -> status (PENDING / ACCEPTED / DENIED)
  memberStatusByClubId = new Map<number, string>();
  /** clubId -> RECRUE | PRESIDENT */
  memberRoleByClubId = new Map<number, string>();

  confirmClubOpen = false;
  selectedClubId: number | null = null;

  // ===== Badge =====
  badgeLoadingClubId: number | null = null;
  badgeMsg = '';

  // ===== Sponsorship =====
  sponsorModalOpen = false;
  sponsorEventId: number | null = null;
  sponsorEventTitle = '';
  /** clubId of the president's club to use for sponsoring */
  sponsorClubId: number | null = null;
  /** eventId -> sponsorClubId (already sponsored) */
  sponsoredEventIds = new Set<number>();

  private pollSub: Subscription | null = null;

  constructor(
    private registrationService: RegistrationService,
    private authService: AuthService,
    private memberService: MemberService,
    public clubService: ClubService
  ) {}

  ngOnInit(): void {
    this.loadMyRegistrations();
    this.loadMyClubs();
    // Poll toutes les 20s pour détecter l'expiration du sponsoring
    this.pollSub = interval(20_000).subscribe(() => this.refreshSponsorStatus());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
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
              // track already-sponsored events
              if (ev?.sponsorClubId) {
                this.sponsoredEventIds.add(eventId);
              }
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
        this.memberStatusByClubId.clear();
        this.memberRoleByClubId.clear();

        (memberships || []).forEach(m => {
          const idClub = Number(m?.idClub);
          const idMember = Number(m?.idMember);
          const status = m?.status || 'PENDING';
          const role = (m as any)?.role || 'RECRUE';
          if (idClub) this.myClubIds.add(idClub);
          if (idClub && idMember) this.memberIdByClubId.set(idClub, idMember);
          if (idClub) this.memberStatusByClubId.set(idClub, status);
          if (idClub) this.memberRoleByClubId.set(idClub, role);
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

  // ==========================
  // SPONSORSHIP
  // ==========================

  /** Returns true if user is PRESIDENT of at least one ACCEPTED club */
  get isPresident(): boolean {
    for (const [clubId, role] of this.memberRoleByClubId) {
      if (role === 'PRESIDENT' && this.memberStatusByClubId.get(clubId) === 'ACCEPTED') {
        return true;
      }
    }
    return false;
  }

  /** Get the clubId where user is president (first one found) */
  get presidentClubId(): number | null {
    for (const [clubId, role] of this.memberRoleByClubId) {
      if (role === 'PRESIDENT' && this.memberStatusByClubId.get(clubId) === 'ACCEPTED') {
        return clubId;
      }
    }
    return null;
  }

  canSponsor(r: any): boolean {
    if (r.status !== 'CONFIRMED') return false;
    if (!this.isPresident) return false;
    if (this.sponsoredEventIds.has(Number(r.eventId))) return false;
    return true;
  }

  openSponsorModal(r: any) {
    this.sponsorEventId = Number(r.eventId);
    this.sponsorEventTitle = r.eventTitle || `Event #${r.eventId}`;
    this.sponsorClubId = this.presidentClubId;
    this.sponsorModalOpen = true;
  }

  onSponsorModalClosed() {
    this.sponsorModalOpen = false;
  }

  onSponsored() {
    if (this.sponsorEventId) {
      this.sponsoredEventIds.add(this.sponsorEventId);
    }
    this.sponsorModalOpen = false;
    this.badgeMsg = `Your club is now sponsoring "${this.sponsorEventTitle}" 🏆`;
  }

  isAlreadySponsored(r: any): boolean {
    return this.sponsoredEventIds.has(Number(r.eventId));
  }

  /** Recheck sponsorClubId pour chaque event — met à jour le bouton si expiré */
  private refreshSponsorStatus() {
    this.myRegs.forEach(r => {
      const eventId = Number(r?.eventId);
      if (!eventId) return;
      this.registrationService.getEventById(eventId).subscribe({
        next: (ev: any) => {
          if (!ev?.sponsorClubId) {
            // sponsoring expiré — rendre le bouton visible
            this.sponsoredEventIds.delete(eventId);
          } else {
            this.sponsoredEventIds.add(eventId);
          }
        }
      });
    });
  }

  onImgError(event: Event) {    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400x200';
  }

  /** Clubs où l’utilisateur est accepté — pour le chat en bas de page */
  get acceptedClubsForChat(): Club[] {
    return this.myClubs.filter(
      c => this.memberStatusByClubId.get(Number(c.idClub)) === 'ACCEPTED'
    );
  }

  get chatUserId(): number | null {
    const cachedUser = this.authService.getCurrentUserValue();
    const id = Number((cachedUser as any)?.id_user);
    return id ? id : null;
  }
}