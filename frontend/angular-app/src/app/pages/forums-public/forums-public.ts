import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../services/forum.service';
import { NotificationService } from '../../services/notification.service';
import { Forum, MessageForum } from '../../models/forum.model';

@Component({
  selector: 'app-forums-public',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forums-public.html',
  styleUrls: ['./forums-public.css']
})
export class ForumsPublicComponent implements OnInit {
  private forumService = inject(ForumService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  forums: Forum[] = [];
  selectedForum: Forum | null = null;
  messages: MessageForum[] = [];
  loading = true;
  searchKeyword = '';

  newMessage: MessageForum = this.initNewMessage();
  showMessageForm = false;

  ngOnInit() {
    this.loadForums();
  }

  loadForums() {
    this.loading = true;
    console.log('🔍 Chargement des forums depuis:', `${this.forumService['apiUrl']}/forums/statut/OUVERT`);
    this.forumService.getForumsByStatut('OUVERT').subscribe({
      next: (data) => {
        console.log('✅ Forums reçus:', data);
        this.forums = data;
        this.loading = false;
        console.log('✅ Loading mis à false, forums.length:', this.forums.length);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Erreur complète:', err);
        this.notificationService.error(err.customMessage || 'Erreur lors du chargement des forums');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectForum(forum: Forum) {
    this.selectedForum = forum;
    this.loadMessages(forum.id!);
  }

  loadMessages(forumId: number) {
    this.forumService.getMessagesByForum(forumId).subscribe({
      next: (data) => {
        this.messages = data.filter(m => m.statut === 'ACTIF');
      },
      error: (err: any) => {
        this.notificationService.error(err.customMessage || 'Erreur lors du chargement des messages');
        console.error(err);
      }
    });
  }

  createMessage() {
    if (!this.selectedForum?.id) return;

    this.forumService.createMessage(this.selectedForum.id, this.newMessage).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.showMessageForm = false;
        this.newMessage = this.initNewMessage();
        this.notificationService.success('Message publié avec succès !');
      },
      error: (err: any) => {
        this.notificationService.error(err.customMessage || 'Erreur lors de l\'envoi du message');
        console.error(err);
      }
    });
  }

  searchMessages() {
    if (!this.searchKeyword.trim()) {
      if (this.selectedForum?.id) {
        this.loadMessages(this.selectedForum.id);
      }
      return;
    }

    this.forumService.searchMessages(this.searchKeyword).subscribe({
      next: (data) => {
        this.messages = data.filter(m => m.statut === 'ACTIF');
        this.notificationService.info(`${this.messages.length} message(s) trouvé(s)`);
      },
      error: (err: any) => {
        this.notificationService.error(err.customMessage || 'Erreur lors de la recherche');
        console.error(err);
      }
    });
  }

  private initNewMessage(): MessageForum {
    return {
      contenu: '',
      auteurId: 1, // À remplacer par l'ID de l'utilisateur connecté
      type_auteur: 'ETUDIANT',
      statut: 'ACTIF'
    };
  }
}
