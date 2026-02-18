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

  searchMessages(keyword: string): Observable<MessageForum[]> {
    return this.http.get<MessageForum[]>(`${this.apiUrl}/messages/search?keyword=${keyword}`);
  }

  getStatistiques(forumId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/forums/${forumId}/statistiques`);
  }
}
