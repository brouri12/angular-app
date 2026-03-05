import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemberService } from '../../services/member.service';
import { Member } from '../../models/member.model';

import { ClubService } from '../../services/club.service';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.css']
})
export class MembersPage implements OnInit {

  loading = false;
  errorMsg = '';
  successMsg = '';

  members: Member[] = [];

  // ✅ cache: idClub -> nomClub
  clubNameById = new Map<number, string>();

  constructor(
    private memberService: MemberService,
    private clubService: ClubService
  ) {}

  ngOnInit(): void {
    // ✅ load clubs first then members
    this.loadClubsThenMembers();
  }

  private loadClubsThenMembers() {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.clubService.getAll().subscribe({
      next: (clubs: any[]) => {
        this.clubNameById.clear();

        (clubs || []).forEach((c: any) => {
          const id = Number(c?.idClub ?? c?.id_club ?? c?.id);
          const name = c?.nomClub ?? c?.nom_club ?? c?.name ?? null;

          if (id && name) this.clubNameById.set(id, name);
        });

        // ✅ after clubs loaded -> load members
        this.loadMembers();
      },
      error: () => {
        // even if clubs fail, still show members
        this.loadMembers();
      }
    });
  }

  loadMembers() {
    this.memberService.getAll().subscribe({
      next: (data: Member[]) => {
        this.members = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error || 'Erreur lors du chargement des membres';
      }
    });
  }

  deleteMember(m: Member) {
    const fullName = `${m.prenom || ''} ${m.nom || ''}`.trim() || `Member #${m.idMember}`;
    const ok = confirm(`Supprimer ${fullName} ?`);
    if (!ok) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.memberService.delete(m.idMember!).subscribe({
      next: () => {
        this.members = this.members.filter(x => x.idMember !== m.idMember);
        this.loading = false;
        this.successMsg = 'Membre supprimé ✅';
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error || 'Erreur lors de la suppression';
      }
    });
  }

  trackById(_: number, m: Member) {
    return m.idMember;
  }

  // ✅ helper display
  getClubName(idClub?: number | null): string {
    const id = Number(idClub);
    if (!id) return '—';
    return this.clubNameById.get(id) || `Club #${id}`;
  }
}