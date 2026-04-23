import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MemberAdminService } from '../../services/member-admin.service';
import { Member, MemberRole, MemberStatus, normalizeMemberFromApi } from '../../models/member.model';
import { ClubService } from '../../services/club.service';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.css']
})
export class MembersPage implements OnInit {
  loading = false;
  errorMsg = '';
  successMsg = '';
  members: Member[] = [];
  clubNameById = new Map<number, string>();
  editOpen = false;
  editSaving = false;
  editTarget: Member | null = null;
  draftStatus: MemberStatus = 'PENDING';
  draftRole: MemberRole = 'RECRUE';
  editModalError = '';

  constructor(
    private memberService: MemberAdminService,
    private clubService: ClubService
  ) {}

  ngOnInit(): void { this.loadClubsThenMembers(); }

  private loadClubsThenMembers() {
    this.loading = true; this.errorMsg = ''; this.successMsg = '';
    this.clubService.getAll().subscribe({
      next: (clubs: any[]) => {
        this.clubNameById.clear();
        (clubs || []).forEach((c: any) => {
          const id = Number(c?.idClub ?? c?.id_club ?? c?.id);
          const name = c?.nomClub ?? c?.nom_club ?? c?.name ?? null;
          if (id && name) this.clubNameById.set(id, name);
        });
        this.loadMembers();
      },
      error: () => this.loadMembers()
    });
  }

  loadMembers() {
    this.memberService.getAll().subscribe({
      next: (data: Member[]) => { this.members = (data || []).map(row => normalizeMemberFromApi(row)); this.loading = false; },
      error: (err: any) => { this.loading = false; this.errorMsg = err?.error || 'Error loading members'; }
    });
  }

  deleteMember(m: Member) {
    const fullName = `${m.prenom || ''} ${m.nom || ''}`.trim() || `Member #${m.idMember}`;
    if (!confirm(`Delete ${fullName}?`)) return;
    this.loading = true; this.errorMsg = ''; this.successMsg = '';
    this.memberService.delete(m.idMember!).subscribe({
      next: () => { this.members = this.members.filter(x => x.idMember !== m.idMember); this.loading = false; this.successMsg = 'Member deleted ✅'; },
      error: (err: any) => { this.loading = false; this.errorMsg = err?.error || 'Delete error'; }
    });
  }

  openEdit(m: Member) { this.errorMsg = ''; this.editModalError = ''; this.editTarget = m; this.draftStatus = (m.status || 'PENDING') as MemberStatus; this.draftRole = (m.role || 'RECRUE') as MemberRole; this.editOpen = true; }
  closeEdit() { if (this.editSaving) return; this.editOpen = false; this.editTarget = null; }
  onEditBackdrop(ev: MouseEvent) { if ((ev.target as HTMLElement).classList.contains('member-edit-overlay')) this.closeEdit(); }

  saveEdit() {
    if (!this.editTarget) return;
    const id = Number(this.editTarget.idMember);
    if (!id) { this.editModalError = 'Invalid member ID'; return; }
    const orig = this.editTarget;
    const prevStatus = (orig.status || 'PENDING') as MemberStatus;
    const prevRole = (orig.role || 'RECRUE') as MemberRole;
    const statusChanged = this.draftStatus !== prevStatus;
    const roleChanged = this.draftRole !== prevRole;
    if (!statusChanged && !roleChanged) { this.closeEdit(); return; }
    this.editSaving = true; this.editModalError = '';
    let chain: Observable<Member>;
    if (statusChanged && roleChanged) chain = this.memberService.updateStatus(id, this.draftStatus).pipe(switchMap(() => this.memberService.updateRole(id, this.draftRole)));
    else if (statusChanged) chain = this.memberService.updateStatus(id, this.draftStatus);
    else chain = this.memberService.updateRole(id, this.draftRole);
    chain.subscribe({
      next: (updated) => {
        const idx = this.members.findIndex(x => x.idMember === orig.idMember);
        if (idx !== -1) { this.members[idx] = normalizeMemberFromApi(updated); this.members = [...this.members]; }
        this.editSaving = false; this.editOpen = false; this.editTarget = null;
        this.successMsg = `Member updated: ${orig.prenom} ${orig.nom}`;
      },
      error: (err: any) => { this.editSaving = false; this.editModalError = (typeof err?.error === 'string' ? err.error : null) || err?.error?.message || err?.message || 'Update error'; }
    });
  }

  trackById(_: number, m: Member) { return m.idMember; }
  getClubName(idClub?: number | null): string { const id = Number(idClub); if (!id) return '—'; return this.clubNameById.get(id) || `Club #${id}`; }
  roleLabel(role?: MemberRole): string { return role === 'PRESIDENT' ? 'Président' : 'Recrue'; }
}
