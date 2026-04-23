import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClubChatMessage {
  id?: number;
  idClub?: number;
  idUser?: number;
  senderName?: string;
  content?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ClubChatService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8888/clubs';

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getMessages(clubId: number, idUser: number): Observable<ClubChatMessage[]> {
    const params = new HttpParams().set('idUser', String(idUser));
    return this.http.get<ClubChatMessage[]>(`${this.baseUrl}/${clubId}/chat/messages`, {
      params,
      headers: this.authHeaders()
    });
  }

  postMessage(clubId: number, idUser: number, content: string): Observable<ClubChatMessage> {
    return this.http.post<ClubChatMessage>(
      `${this.baseUrl}/${clubId}/chat/messages`,
      { idUser, content },
      { headers: this.authHeaders() }
    );
  }
}
