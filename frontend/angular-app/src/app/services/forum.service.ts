import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Forum, MessageForum } from '../models/forum.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private http = inject(HttpClient);
  private apiUrl = environment.forumServiceUrl;

  // CRUD Forums
  getAllForums(): Observable<Forum[]> {
    return this.http.get<Forum[]>(`${this.apiUrl}/forums`);
  }

  getForumById(id: number): Observable<Forum> {
    return this.http.get<Forum>(`${this.apiUrl}/forums/${id}`);
  }

  createForum(forum: Forum): Observable<Forum> {
    return this.http.post<Forum>(`${this.apiUrl}/forums`, forum);
  }

  getForumsByStatut(statut: string): Observable<Forum[]> {
    return this.http.get<Forum[]>(`${this.apiUrl}/forums/statut/${statut}`);
  }

  getForumsByNiveau(niveau: string): Observable<Forum[]> {
    return this.http.get<Forum[]>(`${this.apiUrl}/forums/niveau/${niveau}`);
  }

  // Messages
  getAllMessages(): Observable<MessageForum[]> {
    return this.http.get<MessageForum[]>(`${this.apiUrl}/messages`);
  }

  getMessagesByForum(forumId: number): Observable<MessageForum[]> {
    return this.http.get<MessageForum[]>(`${this.apiUrl}/messages/forum/${forumId}`);
  }

  createMessage(forumId: number, message: MessageForum): Observable<MessageForum> {
    return this.http.post<MessageForum>(`${this.apiUrl}/messages/forum/${forumId}`, message);
  }

  updateMessage(messageId: number, message: MessageForum): Observable<MessageForum> {
    // Envoyer seulement le contenu pour éviter les problèmes de validation
    return this.http.put<MessageForum>(`${this.apiUrl}/messages/${messageId}`, {
      contenu: message.contenu
    });
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${messageId}`);
  }

  searchMessages(keyword: string): Observable<MessageForum[]> {
    return this.http.get<MessageForum[]>(`${this.apiUrl}/messages/search?keyword=${keyword}`);
  }

  getStatistiques(forumId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/forums/${forumId}/statistiques`);
  }

  // ========== INTERACTIONS (Likes & Réponses) ==========
  
  // Likes
  likerMessage(messageId: number, utilisateurId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/interactions/likes/${messageId}/${utilisateurId}`, {});
  }

  unlikerMessage(messageId: number, utilisateurId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/interactions/likes/${messageId}/${utilisateurId}`);
  }

  getNombreLikes(messageId: number): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/interactions/likes/${messageId}/count`);
  }

  checkLike(messageId: number, utilisateurId: number): Observable<{aLike: boolean}> {
    return this.http.get<{aLike: boolean}>(`${this.apiUrl}/interactions/likes/${messageId}/check/${utilisateurId}`);
  }

  getLikesMessage(messageId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/interactions/likes/${messageId}`);
  }

  // Réponses
  creerReponse(reponse: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/interactions/reponses`, reponse);
  }

  getReponsesMessage(messageId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/interactions/reponses/${messageId}`);
  }

  getNombreReponses(messageId: number): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/interactions/reponses/${messageId}/count`);
  }

  modifierReponse(reponseId: number, contenu: string, utilisateurId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/interactions/reponses/${reponseId}?contenu=${encodeURIComponent(contenu)}&utilisateurId=${utilisateurId}`, {});
  }

  supprimerReponse(reponseId: number, utilisateurId: number, typeUtilisateur: string = 'ETUDIANT'): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/interactions/reponses/${reponseId}?utilisateurId=${utilisateurId}&typeUtilisateur=${typeUtilisateur}`);
  }

  // ========== MODÉRATION ==========
  
  creerSignalement(signalement: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/moderation/signalements`, signalement);
  }

  getSignalementsEnAttente(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/moderation/signalements/en-attente`);
  }

  getSignalementsMessage(messageId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/moderation/signalements/message/${messageId}`);
  }

  traiterSignalement(signalementId: number, moderateurId: number, decision: string, commentaire?: string): Observable<any> {
    let url = `${this.apiUrl}/moderation/signalements/${signalementId}/traiter?moderateurId=${moderateurId}&decision=${decision}`;
    if (commentaire) {
      url += `&commentaire=${encodeURIComponent(commentaire)}`;
    }
    return this.http.put(url, {});
  }

  getMessagesAvecMultiplesSignalements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/moderation/signalements/multiples`);
  }

  // ========== NOTIFICATIONS ==========
  
  getNotificationsUtilisateur(utilisateurId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications/utilisateur/${utilisateurId}`);
  }

  getNotificationsNonLues(utilisateurId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications/utilisateur/${utilisateurId}/non-lues`);
  }

  compterNotificationsNonLues(utilisateurId: number): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}/notifications/utilisateur/${utilisateurId}/non-lues/count`);
  }

  marquerNotificationLue(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/marquer-lue`, {});
  }

  marquerToutesNotificationsLues(utilisateurId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/utilisateur/${utilisateurId}/marquer-toutes-lues`, {});
  }

  supprimerNotification(notificationId: number, utilisateurId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notifications/${notificationId}?utilisateurId=${utilisateurId}`);
  }

  // ========== BADGES & GAMIFICATION ==========
  
  getBadgeUtilisateur(utilisateurId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/badges/utilisateur/${utilisateurId}`);
  }

  ajouterPoints(utilisateurId: number, points: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/badges/utilisateur/${utilisateurId}/points?points=${points}`, {});
  }

  retirerPoints(utilisateurId: number, points: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/badges/utilisateur/${utilisateurId}/points?points=${points}`);
  }

  mettreAJourStatistiquesBadge(utilisateurId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/badges/utilisateur/${utilisateurId}/statistiques`, {});
  }

  getTopContributeurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/badges/top-contributeurs`);
  }

  getBadgesByNiveau(niveau: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/badges/niveau/${niveau}`);
  }

  // ========== ANALYSE & STATISTIQUES ==========
  
  getStatistiquesGlobales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyse/statistiques/globales`);
  }

  getStatistiquesParForum(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyse/statistiques/par-forum`);
  }

  getStatistiquesParNiveau(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyse/statistiques/par-niveau`);
  }

  getForumLePlusActif(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyse/forum-plus-actif`);
  }

  getEtudiantLePlusActif(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyse/etudiant-plus-actif`);
  }

  getTauxEngagementParGroupe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyse/engagement/par-groupe`);
  }

  getAnalysePeriodeActivite(dateDebut: string, dateFin: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analyse/activite/periode?dateDebut=${dateDebut}&dateFin=${dateFin}`);
  }
}
