import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../../services/forum.service';
import { Forum, MessageForum } from '../../models/forum.model';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forum.html',
  styleUrls: ['./forum.css']
})
export class ForumComponent implements OnInit {
  private forumService = inject(ForumService);

  forums: Forum[] = [];
  selectedForum: Forum | null = null;
  messages: MessageForum[] = [];
  loading = false;
  error = '';

  newForum: Forum = this.initNewForum();
  newMessage: MessageForum = this.initNewMessage();
  showForumForm = false;
  showMessageForm = false;

  ngOnInit() {
    this.loadForums();
  }

  loadForums() {
    this.loading = true;
    this.forumService.getAllForums().subscribe({
      next: (data) => {
        this.forums = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des forums';
        this.loading = false;
        console.error(err);
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
        this.messages = data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des messages';
        console.error(err);
      }
    });
  }

  createForum() {
    // Ajouter la date de création automatiquement
    const forumToCreate = {
      ...this.newForum,
      date_creation: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
    };
    
    this.forumService.createForum(forumToCreate).subscribe({
      next: (forum) => {
        this.forums.push(forum);
        this.showForumForm = false;
        this.newForum = this.initNewForum();
        this.error = '';
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        
        // Afficher les erreurs de validation du backend
        if (err.error && err.error.errors) {
          const errors = Object.entries(err.error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          this.error = `Erreur de validation:\n${errors}`;
        } else if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Erreur lors de la création du forum';
        }
      }
    });
  }

  createMessage() {
    if (!this.selectedForum?.id) return;

    // Ajouter la date du message automatiquement
    const messageToCreate = {
      ...this.newMessage,
      date_message: new Date().toISOString()
    };

    this.forumService.createMessage(this.selectedForum.id, messageToCreate).subscribe({
      next: (message) => {
        this.messages.push(message);
        this.showMessageForm = false;
        this.newMessage = this.initNewMessage();
        this.error = '';
      },
      error: (err) => {
        console.error('Erreur complète:', err);
        
        // Afficher les erreurs de validation du backend
        if (err.error && err.error.errors) {
          const errors = Object.entries(err.error.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          this.error = `Erreur de validation:\n${errors}`;
        } else if (err.error && err.error.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Erreur lors de la création du message';
        }
      }
    });
  }

  deleteForum(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce forum ?')) {
      this.forumService.deleteForum(id).subscribe({
        next: () => {
          this.forums = this.forums.filter(f => f.id !== id);
          if (this.selectedForum?.id === id) {
            this.selectedForum = null;
            this.messages = [];
          }
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error(err);
        }
      });
    }
  }

  fermerForum(id: number) {
    this.forumService.fermerForum(id).subscribe({
      next: (forum) => {
        const index = this.forums.findIndex(f => f.id === id);
        if (index !== -1) {
          this.forums[index] = forum;
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de la fermeture';
        console.error(err);
      }
    });
  }

  private initNewForum(): Forum {
    return {
      titre: '',
      description: '',
      cree_par: 1,
      niveau: '',
      groupe: '',
      cours: '',
      statut: 'OUVERT'
    };
  }

  private initNewMessage(): MessageForum {
    return {
      contenu: '',
      auteurId: 1,
      type_auteur: 'ETUDIANT',
      statut: 'ACTIF'
    };
  }
}
