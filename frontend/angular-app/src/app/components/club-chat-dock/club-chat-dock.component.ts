import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Club } from '../../services/club.service';
import { ClubChatMessage, ClubChatService } from '../../services/club-chat.service';

@Component({
  selector: 'app-club-chat-dock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './club-chat-dock.component.html',
  styleUrls: ['./club-chat-dock.component.css']
})
export class ClubChatDockComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  @Input() acceptedClubs: Club[] = [];
  @Input() idUser: number | null = null;

  @ViewChild('msgScroll') msgScroll?: ElementRef<HTMLDivElement>;

  expanded = false;
  selectedClubId: number | null = null;
  messages: ClubChatMessage[] = [];
  draft = '';
  loading = false;
  sending = false;
  sendError = '';
  pollId: ReturnType<typeof setInterval> | null = null;
  private scrollPending = false;

  constructor(private clubChat: ClubChatService) {}

  ngOnInit(): void {
    this.pickDefaultClub();
    this.startPoll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['acceptedClubs'] && this.acceptedClubs?.length) {
      const stillValid =
        this.selectedClubId != null &&
        this.acceptedClubs.some(c => Number(c.idClub) === Number(this.selectedClubId));
      if (!stillValid) {
        this.pickDefaultClub();
      }
      if (this.expanded) {
        this.loadMessages();
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.scrollPending && this.msgScroll) {
      const el = this.msgScroll.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.scrollPending = false;
    }
  }

  ngOnDestroy(): void {
    this.stopPoll();
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.loadMessages();
      this.scrollPending = true;
    }
  }

  private pickDefaultClub(): void {
    const first = this.acceptedClubs?.[0];
    this.selectedClubId = first?.idClub != null ? Number(first.idClub) : null;
  }

  onClubChange(): void {
    this.sendError = '';
    this.loadMessages();
    this.scrollPending = true;
  }

  loadMessages(): void {
    if (!this.idUser || !this.selectedClubId) return;
    this.loading = true;
    this.clubChat.getMessages(this.selectedClubId, this.idUser).subscribe({
      next: rows => {
        this.messages = rows || [];
        this.loading = false;
        this.scrollPending = true;
      },
      error: () => {
        this.loading = false;
        this.messages = [];
      }
    });
  }

  send(): void {
    this.sendError = '';
    const text = (this.draft || '').trim();
    if (!text || !this.idUser || !this.selectedClubId || this.sending) return;

    // Optimistic update : afficher immédiatement sans attendre le backend
    const tempId = -Date.now();
    const tempMsg: ClubChatMessage = {
      id: tempId,
      idClub: this.selectedClubId,
      idUser: this.idUser,
      senderName: 'Vous',
      content: text,
      createdAt: new Date().toISOString()
    };
    this.messages = [...this.messages, tempMsg];
    this.draft = '';
    this.sending = true;
    this.scrollPending = true;

    this.clubChat.postMessage(this.selectedClubId, this.idUser, text).subscribe({
      next: msg => {
        // Remplacer le message temporaire par le vrai
        this.messages = this.messages.map(m => m.id === tempId ? msg : m);
        this.sending = false;
      },
      error: err => {
        // Supprimer le message temporaire si refusé (bad word, spam...)
        this.messages = this.messages.filter(m => m.id !== tempId);
        const body = err?.error;
        this.sendError =
          typeof body === 'string' && body.length
            ? body
            : err?.message || 'Impossible d\'envoyer le message.';
        this.sending = false;
      }
    });
  }

  private startPoll(): void {
    this.stopPoll();
    this.pollId = setInterval(() => {
      if (!this.expanded || !this.idUser || !this.selectedClubId) return;
      this.clubChat.getMessages(this.selectedClubId, this.idUser).subscribe({
        next: rows => {
          this.messages = rows || [];
        },
        error: () => {}
      });
    }, 5000);
  }

  private stopPoll(): void {
    if (this.pollId != null) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
  }

  trackById(_i: number, m: ClubChatMessage): number | undefined {
    return m.id;
  }
}
