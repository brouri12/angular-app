import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ForumService } from '../../services/forum.service';
import { Forum, MessageForum } from '../../models/forum.model';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, TranslateModule],
  templateUrl: './forum.html',
  styleUrls: ['./forum.css']
})
export class ForumComponent implements OnInit {
  private forumService = inject(ForumService);
  private cdr = inject(ChangeDetectorRef);

  forums: Forum[] = [];
  selectedForum: Forum | null = null;
  editingForum: Forum | null = null;
  editingMessage: MessageForum | null = null;
  messages: MessageForum[] = [];
  loading = false;
  error = '';
  successMessage = '';

  newForum: Forum = this.initNewForum();
  newMessage: MessageForum = this.initNewMessage();
  showForumForm = false;
  showMessageForm = false;

  // Nouvelles fonctionnalités
  messageLikes: Map<number, number> = new Map();
  messageReponses: Map<number, number> = new Map();
  userLikes: Map<number, boolean> = new Map();
  currentUserId = 1; // ID utilisateur simulé
  showReponsesFor: number | null = null;
  reponses: any[] = [];
  newReponse = { contenu: '', auteurId: 1 };
  showReponseForm = false;
  selectedMessageForReponse: number | null = null;
  
  // Signalements
  showSignalementForm = false;
  selectedMessageForSignalement: number | null = null;
  newSignalement = { motif: '', description: '' };
  
  // Statistiques
  showStatistiques = false;
  statistiquesGlobales: any = null;
  topContributeurs: any[] = [];
  
  // Badges
  showBadges = false;
  userBadge: any = null;

  ngOnInit() {
    this.loadForums();
  }

  loadForums() {
    this.loading = true;
    this.cdr.detectChanges();
    this.forumService.getAllForums().subscribe({
      next: (data) => {
        this.forums = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des forums';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  selectForum(forum: Forum) {
    this.selectedForum = forum;
    this.loadMessages(forum.id!);
    this.cdr.detectChanges();
  }

  loadMessages(forumId: number) {
    console.log('🔄 Chargement des messages pour le forum:', forumId);
    this.forumService.getMessagesByForum(forumId).subscribe({
      next: (data) => {
        console.log('✅ Messages chargés:', data.length);
        this.messages = data;
        // Charger les likes et réponses pour chaque message
        this.messages.forEach(message => {
          if (message.id) {
            console.log('📊 Chargement des stats pour le message:', message.id);
            this.loadMessageStats(message.id);
          }
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des messages';
        this.cdr.detectChanges();
        console.error('❌ Erreur chargement messages:', err);
      }
    });
  }

  loadMessageStats(messageId: number) {
    console.log('📊 Chargement stats pour message:', messageId);
    // Charger le nombre de likes
    this.forumService.getNombreLikes(messageId).subscribe({
      next: (data) => {
        console.log('❤️ Likes pour message', messageId, ':', data.count);
        this.messageLikes.set(messageId, data.count);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur chargement likes:', err);
      }
    });

    // Charger le nombre de réponses
    this.forumService.getNombreReponses(messageId).subscribe({
      next: (data) => {
        console.log('💬 Réponses pour message', messageId, ':', data.count);
        this.messageReponses.set(messageId, data.count);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur chargement réponses:', err);
      }
    });

    // Vérifier si l'utilisateur a liké
    this.forumService.checkLike(messageId, this.currentUserId).subscribe({
      next: (data) => {
        console.log('✅ User like status pour message', messageId, ':', data.aLike);
        this.userLikes.set(messageId, data.aLike);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur check like:', err);
      }
    });
  }

  toggleLike(messageId: number) {
    const hasLiked = this.userLikes.get(messageId);
    
    if (hasLiked) {
      this.forumService.unlikerMessage(messageId, this.currentUserId).subscribe({
        next: () => {
          this.userLikes.set(messageId, false);
          const currentCount = this.messageLikes.get(messageId) || 0;
          this.messageLikes.set(messageId, currentCount - 1);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erreur lors du unlike';
          console.error(err);
        }
      });
    } else {
      this.forumService.likerMessage(messageId, this.currentUserId).subscribe({
        next: () => {
          this.userLikes.set(messageId, true);
          const currentCount = this.messageLikes.get(messageId) || 0;
          this.messageLikes.set(messageId, currentCount + 1);
          this.successMessage = '👍 Message liké !';
          setTimeout(() => this.successMessage = '', 3000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.error && err.error.error) {
            this.error = err.error.error;
          } else {
            this.error = 'Erreur lors du like';
          }
          console.error(err);
        }
      });
    }
  }

  openReponseForm(messageId: number) {
    this.selectedMessageForReponse = messageId;
    this.showReponseForm = true;
    this.newReponse = { contenu: '', auteurId: this.currentUserId };
  }

  creerReponse() {
    if (!this.selectedMessageForReponse) return;

    const reponse = {
      messageParentId: this.selectedMessageForReponse,
      auteurId: this.currentUserId,
      contenu: this.newReponse.contenu,
      typeAuteur: 'ETUDIANT',
      statut: 'ACTIF'
    };

    console.log('📤 Envoi réponse:', reponse);

    this.forumService.creerReponse(reponse).subscribe({
      next: () => {
        this.successMessage = '💬 Réponse publiée !';
        setTimeout(() => this.successMessage = '', 3000);
        this.showReponseForm = false;
        this.newReponse = { contenu: '', auteurId: this.currentUserId };
        // Recharger les stats
        if (this.selectedMessageForReponse) {
          this.loadMessageStats(this.selectedMessageForReponse);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur création réponse:', err);
        if (err.error && err.error.error) {
          this.error = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Erreur lors de la création de la réponse';
        }
        this.cdr.detectChanges();
      }
    });
  }

  toggleReponses(messageId: number) {
    if (this.showReponsesFor === messageId) {
      this.showReponsesFor = null;
      this.reponses = [];
    } else {
      this.showReponsesFor = messageId;
      this.forumService.getReponsesMessage(messageId).subscribe({
        next: (data) => {
          this.reponses = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des réponses';
          console.error(err);
        }
      });
    }
  }

  openSignalementForm(messageId: number) {
    this.selectedMessageForSignalement = messageId;
    this.showSignalementForm = true;
    this.newSignalement = { motif: '', description: '' };
  }

  creerSignalement() {
    if (!this.selectedMessageForSignalement) return;

    const signalement = {
      messageId: this.selectedMessageForSignalement,
      signalePar: this.currentUserId,
      motif: this.newSignalement.description || 'Signalement pour ' + this.newSignalement.motif,
      type: this.newSignalement.motif, // SPAM, INAPPROPRIE, etc.
      statut: 'EN_ATTENTE'
    };

    console.log('📤 Envoi signalement:', signalement);

    this.forumService.creerSignalement(signalement).subscribe({
      next: () => {
        this.successMessage = '🚨 Signalement envoyé !';
        setTimeout(() => this.successMessage = '', 3000);
        this.showSignalementForm = false;
        this.newSignalement = { motif: '', description: '' };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur création signalement:', err);
        if (err.error && err.error.error) {
          this.error = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Erreur lors du signalement';
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadStatistiques() {
    this.showStatistiques = true;
    this.forumService.getStatistiquesGlobales().subscribe({
      next: (data) => {
        this.statistiquesGlobales = data;
        this.topContributeurs = data.topContributeurs || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques';
        console.error(err);
      }
    });
  }

  loadUserBadge() {
    this.showBadges = true;
    this.forumService.getBadgeUtilisateur(this.currentUserId).subscribe({
      next: (data) => {
        this.userBadge = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du badge';
        console.error(err);
      }
    });
  }

  getBadgeColor(niveau: string): string {
    switch(niveau) {
      case 'BRONZE': return 'bg-orange-600';
      case 'ARGENT': return 'bg-gray-400';
      case 'OR': return 'bg-yellow-500';
      case 'PLATINE': return 'bg-purple-600';
      default: return 'bg-gray-500';
    }
  }

  createForum() {
    if (this.editingForum) {
      // Update existing forum
      const forumToUpdate = {
        ...this.newForum,
        id: this.editingForum.id
      };
      
      this.forumService.updateForum(this.editingForum.id!, forumToUpdate).subscribe({
        next: (forum) => {
          const index = this.forums.findIndex(f => f.id === forum.id);
          if (index !== -1) {
            this.forums[index] = forum;
          }
          this.showForumForm = false;
          this.editingForum = null;
          this.newForum = this.initNewForum();
          this.error = '';
          this.successMessage = '✅ Forum mis à jour avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur complète:', err);
          if (err.error && err.error.errors) {
            const errors = Object.entries(err.error.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join('\n');
            this.error = `Erreur de validation:\n${errors}`;
          } else if (err.error && err.error.message) {
            this.error = err.error.message;
          } else {
            this.error = 'Erreur lors de la mise à jour du forum';
          }
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new forum
      const forumToCreate = {
        ...this.newForum,
        date_creation: new Date().toISOString().split('T')[0]
      };
      
      this.forumService.createForum(forumToCreate).subscribe({
        next: (forum) => {
          this.forums.push(forum);
          this.showForumForm = false;
          this.newForum = this.initNewForum();
          this.error = '';
          this.successMessage = '✅ Forum créé avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur complète:', err);
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
          this.cdr.detectChanges();
        }
      });
    }
  }

  openUpdateForm(forum: Forum) {
    this.editingForum = forum;
    this.newForum = { ...forum };
    this.showForumForm = true;
    this.cdr.detectChanges();
  }

  createMessage() {
    if (!this.selectedForum?.id) return;

    if (this.editingMessage) {
      // Update existing message
      this.forumService.updateMessage(this.editingMessage.id!, this.newMessage).subscribe({
        next: (updatedMessage) => {
          const index = this.messages.findIndex(m => m.id === updatedMessage.id);
          if (index !== -1) {
            this.messages[index] = updatedMessage;
          }
          this.showMessageForm = false;
          this.editingMessage = null;
          this.newMessage = this.initNewMessage();
          this.error = '';
          this.successMessage = '✅ Message modifié avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur complète:', err);
          if (err.error && err.error.errors) {
            const errors = Object.entries(err.error.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join('\n');
            this.error = `Erreur de validation:\n${errors}`;
          } else if (err.error && err.error.message) {
            this.error = err.error.message;
          } else {
            this.error = 'Erreur lors de la modification du message';
          }
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new message
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
          this.successMessage = '✅ Message créé avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        }
      });
    }
  }

  openUpdateMessageForm(message: MessageForum) {
    this.editingMessage = message;
    this.newMessage = { ...message };
    this.showMessageForm = true;
    this.cdr.detectChanges();
  }

  deleteMessage(messageId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    this.forumService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.successMessage = '✅ Message supprimé avec succès !';
        setTimeout(() => this.successMessage = '', 5000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression du message';
        this.cdr.detectChanges();
        console.error(err);
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
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la fermeture';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  rouvrirForum(id: number) {
    this.forumService.rouvrirForum(id).subscribe({
      next: (forum) => {
        const index = this.forums.findIndex(f => f.id === id);
        if (index !== -1) {
          this.forums[index] = forum;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors de la réouverture';
        this.cdr.detectChanges();
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
