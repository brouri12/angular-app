import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ForumService } from '../../services/forum.service';
import { NotificationService } from '../../services/notification.service';
import { MultimediaService, MediaFileDTO } from '../../services/multimedia.service';
import { Forum, MessageForum } from '../../models/forum.model';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-forums-public',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, TranslateModule],
  templateUrl: './forums-public.html',
  styleUrls: ['./forums-public.css']
})
export class ForumsPublicComponent implements OnInit {
  private forumService = inject(ForumService);
  private notificationService = inject(NotificationService);
  private multimediaService = inject(MultimediaService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  forums: Forum[] = [];
  selectedForum: Forum | null = null;
  messages: MessageForum[] = [];
  loading = true;
  searchKeyword = '';
  editingMessage: MessageForum | null = null;

  newMessage: MessageForum = this.initNewMessage();
  showMessageForm = false;

  // Nouvelles propriétés pour les fonctionnalités avancées
  messageLikes: Map<number, number> = new Map();
  messageReponses: Map<number, number> = new Map();
  userLikes: Map<number, boolean> = new Map();
  currentUserId = 1; // À remplacer par l'ID de l'utilisateur connecté
  showReponsesFor: number | null = null;
  reponses: any[] = [];
  
  // Multimédia
  messageMedia: Map<number, MediaFileDTO[]> = new Map();
  selectedImageFile: File | null = null;
  selectedAudioFile: File | null = null;
  selectedDocumentFile: File | null = null;
  videoUrl: string = '';
  uploadingMedia = false;
  
  // Modals
  showReponseForm = false;
  showSignalementForm = false;
  showStatistiquesModal = false;
  showBadgeModal = false;
  
  // Données pour les modals
  selectedMessageForReponse: MessageForum | null = null;
  selectedMessageForSignalement: MessageForum | null = null;
  newReponse = { contenu: '' };
  newSignalement = { motif: '', type: 'SPAM' };
  statistiquesGlobales: any = null;
  topContributeurs: any[] = [];
  userBadge: any = null;

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
        // Charger les stats pour chaque message
        this.messages.forEach(message => {
          if (message.id) {
            this.loadMessageStats(message.id);
            this.loadMessageMedia(message.id);
          }
        });
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.notificationService.error(err.customMessage || 'Erreur lors du chargement des messages');
        console.error(err);
      }
    });
  }

  loadMessageMedia(messageId: number) {
    this.multimediaService.getMediaByMessage(messageId).subscribe({
      next: (media) => {
        this.messageMedia.set(messageId, media);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement médias:', err)
    });
  }

  getMediaUrl(mediaId: number): string {
    return `http://localhost:8082/api/forum/multimedia/file/${mediaId}`;
  }

  getYouTubeEmbedUrl(videoId: string): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  openMediaPreview(media: MediaFileDTO) {
    // Ouvrir l'image dans une nouvelle fenêtre ou modal
    window.open(this.getMediaUrl(media.id!), '_blank');
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
      error: (err) => console.error('Erreur chargement likes:', err)
    });

    // Charger le nombre de réponses
    this.forumService.getNombreReponses(messageId).subscribe({
      next: (data) => {
        console.log('💬 Réponses pour message', messageId, ':', data.count);
        this.messageReponses.set(messageId, data.count);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement réponses:', err)
    });

    // Vérifier si l'utilisateur a liké
    this.forumService.checkLike(messageId, this.currentUserId).subscribe({
      next: (data) => {
        console.log('✅ User like status pour message', messageId, ':', data.aLike);
        this.userLikes.set(messageId, data.aLike);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur check like:', err)
    });
  }

  toggleLike(messageId: number) {
    const hasLiked = this.userLikes.get(messageId) || false;
    
    if (hasLiked) {
      // Unlike
      this.forumService.unlikerMessage(messageId, this.currentUserId).subscribe({
        next: () => {
          this.userLikes.set(messageId, false);
          const currentLikes = this.messageLikes.get(messageId) || 0;
          this.messageLikes.set(messageId, Math.max(0, currentLikes - 1));
          this.notificationService.success('👎 Like retiré');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('Erreur lors du retrait du like');
          console.error(err);
        }
      });
    } else {
      // Like
      this.forumService.likerMessage(messageId, this.currentUserId).subscribe({
        next: () => {
          this.userLikes.set(messageId, true);
          const currentLikes = this.messageLikes.get(messageId) || 0;
          this.messageLikes.set(messageId, currentLikes + 1);
          this.notificationService.success('❤️ Message liké !');
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.notificationService.error('Erreur lors du like');
          console.error(err);
        }
      });
    }
  }

  openReponseForm(message: MessageForum) {
    this.selectedMessageForReponse = message;
    this.newReponse = { contenu: '' };
    this.showReponseForm = true;
    this.cdr.detectChanges();
  }

  creerReponse() {
    if (!this.selectedMessageForReponse?.id || !this.newReponse.contenu.trim()) {
      return;
    }

    const messageId = this.selectedMessageForReponse.id; // Sauvegarder l'ID avant de mettre à null

    const reponseData = {
      messageParentId: messageId,
      auteurId: this.currentUserId,
      contenu: this.newReponse.contenu,
      typeAuteur: 'ETUDIANT',
      statut: 'ACTIF'
    };

    console.log('📤 Envoi réponse:', reponseData);

    this.forumService.creerReponse(reponseData).subscribe({
      next: (reponse) => {
        console.log('✅ Réponse créée:', reponse);
        this.showReponseForm = false;
        this.newReponse = { contenu: '' };
        this.selectedMessageForReponse = null;
        this.notificationService.success('✅ Réponse publiée avec succès !');
        // Recharger les stats avec l'ID sauvegardé
        this.loadMessageStats(messageId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('❌ Erreur création réponse:', err);
        this.notificationService.error('Erreur lors de la création de la réponse');
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
          this.notificationService.error('Erreur lors du chargement des réponses');
          console.error(err);
        }
      });
    }
  }

  openSignalementForm(message: MessageForum) {
    this.selectedMessageForSignalement = message;
    this.newSignalement = { motif: '', type: 'SPAM' };
    this.showSignalementForm = true;
    this.cdr.detectChanges();
  }

  creerSignalement() {
    if (!this.selectedMessageForSignalement?.id || !this.newSignalement.motif.trim() || this.newSignalement.motif.length < 10) {
      this.notificationService.error('Le motif doit contenir au moins 10 caractères');
      return;
    }

    const signalementData = {
      messageId: this.selectedMessageForSignalement.id,
      signalePar: this.currentUserId,
      motif: this.newSignalement.motif,
      type: this.newSignalement.type,
      statut: 'EN_ATTENTE'
    };

    console.log('📤 Envoi signalement:', signalementData);

    this.forumService.creerSignalement(signalementData).subscribe({
      next: (signalement) => {
        console.log('✅ Signalement créé:', signalement);
        this.showSignalementForm = false;
        this.newSignalement = { motif: '', type: 'SPAM' };
        this.selectedMessageForSignalement = null;
        this.notificationService.success('✅ Signalement envoyé avec succès !');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('❌ Erreur création signalement:', err);
        this.notificationService.error('Erreur lors de la création du signalement');
      }
    });
  }

  loadStatistiques() {
    this.forumService.getStatistiquesGlobales().subscribe({
      next: (data) => {
        this.statistiquesGlobales = data;
        this.showStatistiquesModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Erreur lors du chargement des statistiques');
        console.error(err);
      }
    });

    this.forumService.getTopContributeurs().subscribe({
      next: (data) => {
        this.topContributeurs = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement top contributeurs:', err)
    });
  }

  loadUserBadge() {
    this.forumService.getBadgeUtilisateur(this.currentUserId).subscribe({
      next: (data) => {
        this.userBadge = data;
        this.showBadgeModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.notificationService.error('Erreur lors du chargement du badge');
        console.error(err);
      }
    });
  }

  getBadgeColor(niveau: string): string {
    switch (niveau) {
      case 'BRONZE': return 'from-amber-600 to-amber-800';
      case 'ARGENT': return 'from-gray-400 to-gray-600';
      case 'OR': return 'from-yellow-400 to-yellow-600';
      case 'PLATINE': return 'from-cyan-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  }

  openMessageForm() {
    this.editingMessage = null;
    this.newMessage = this.initNewMessage();
    this.showMessageForm = true;
    this.cdr.detectChanges();
  }

  openEditForm(message: MessageForum) {
    this.editingMessage = message;
    this.newMessage = { ...message };
    this.showMessageForm = true;
    this.cdr.detectChanges();
  }

  createMessage() {
      if (!this.selectedForum?.id) return;

      if (this.editingMessage) {
        // Update existing message
        console.log('🔄 Mise à jour du message:', this.editingMessage.id);
        console.log('📤 Données envoyées:', this.newMessage);

        this.forumService.updateMessage(this.editingMessage.id!, this.newMessage).subscribe({
          next: (updatedMessage) => {
            console.log('✅ Message mis à jour:', updatedMessage);
            const index = this.messages.findIndex(m => m.id === updatedMessage.id);
            if (index !== -1) {
              this.messages[index] = updatedMessage;
            }
            this.showMessageForm = false;
            this.editingMessage = null;
            this.newMessage = this.initNewMessage();
            this.clearMediaSelection();
            this.notificationService.success('✅ Message modifié avec succès !');
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('❌ Erreur lors de la modification:', err);
            console.error('❌ Détails de l\'erreur:', err.error);
            this.notificationService.error(err.customMessage || 'Erreur lors de la modification du message');
          }
        });
      } else {
        // Create new message
        this.forumService.createMessage(this.selectedForum.id, this.newMessage).subscribe({
          next: (message) => {
            this.messages.push(message);
            this.showMessageForm = false;
            this.newMessage = this.initNewMessage();
            this.notificationService.success('✅ Message publié avec succès !');

            // Upload media files if any
            if (message.id && (this.selectedImageFile || this.selectedAudioFile || this.selectedDocumentFile || this.videoUrl)) {
              this.uploadMediaFiles(message.id);
            } else {
              this.clearMediaSelection();
            }

            this.cdr.detectChanges();
          },
          error: (err: any) => {
            this.notificationService.error(err.customMessage || 'Erreur lors de l\'envoi du message');
            console.error(err);
          }
        });
      }
    }


  deleteMessage(messageId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    this.forumService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.notificationService.success('✅ Message supprimé avec succès !');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.notificationService.error(err.customMessage || 'Erreur lors de la suppression du message');
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

  // Gestion des fichiers multimédia
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!this.multimediaService.validateImageFormat(file)) {
        this.notificationService.error('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP');
        return;
      }
      if (!this.multimediaService.validateFileSize(file, 5)) {
        this.notificationService.error('L\'image ne doit pas dépasser 5 MB');
        return;
      }
      this.selectedImageFile = file;
      this.notificationService.success(`Image sélectionnée: ${file.name}`);
    }
  }

  onAudioSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!this.multimediaService.validateAudioFormat(file)) {
        this.notificationService.error('Format audio non supporté. Utilisez MP3, WAV ou OGG');
        return;
      }
      if (!this.multimediaService.validateFileSize(file, 10)) {
        this.notificationService.error('L\'audio ne doit pas dépasser 10 MB');
        return;
      }
      this.selectedAudioFile = file;
      this.notificationService.success(`Audio sélectionné: ${file.name}`);
    }
  }

  onDocumentSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!this.multimediaService.validateDocumentFormat(file)) {
        this.notificationService.error('Format de document non supporté');
        return;
      }
      if (!this.multimediaService.validateFileSize(file, 20)) {
        this.notificationService.error('Le document ne doit pas dépasser 20 MB');
        return;
      }
      this.selectedDocumentFile = file;
      this.notificationService.success(`Document sélectionné: ${file.name}`);
    }
  }

  uploadMediaFiles(messageId: number) {
    const uploads: any[] = [];

    if (this.selectedImageFile) {
      uploads.push(
        this.multimediaService.uploadImage(this.selectedImageFile, messageId, this.currentUserId)
      );
    }

    if (this.selectedAudioFile) {
      uploads.push(
        this.multimediaService.uploadAudio(this.selectedAudioFile, messageId, this.currentUserId)
      );
    }

    if (this.selectedDocumentFile) {
      uploads.push(
        this.multimediaService.uploadDocument(this.selectedDocumentFile, messageId, this.currentUserId)
      );
    }

    if (this.videoUrl.trim()) {
      uploads.push(
        this.multimediaService.embedVideo(this.videoUrl, messageId, this.currentUserId)
      );
    }

    if (uploads.length > 0) {
      this.uploadingMedia = true;
      Promise.all(uploads.map(obs => obs.toPromise()))
        .then((results) => {
          this.notificationService.success('✅ Médias téléchargés avec succès !');
          // Stocker les médias uploadés pour ce message
          const mediaFiles = results.filter(r => r != null) as MediaFileDTO[];
          this.messageMedia.set(messageId, mediaFiles);
          this.clearMediaSelection();
          this.uploadingMedia = false;
          this.cdr.detectChanges();
        })
        .catch((error) => {
          console.error('Erreur upload:', error);
          this.notificationService.error('❌ Erreur lors du téléchargement des médias');
          this.uploadingMedia = false;
        });
    }
  }

  clearMediaSelection() {
    this.selectedImageFile = null;
    this.selectedAudioFile = null;
    this.selectedDocumentFile = null;
    this.videoUrl = '';
  }
}
