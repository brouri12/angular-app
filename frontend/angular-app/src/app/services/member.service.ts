import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/member.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MemberService {

  private apiUrl = 'http://localhost:8888/membres';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  create(member: Member): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, member, {
      headers: this.getHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getAll(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getByUser(idUser: number): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/by-user/${idUser}`, {
      headers: this.getHeaders()
    });
  }

  exists(idUser: number, idClub: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists/${idUser}/${idClub}`, {
      headers: this.getHeaders()
    });
  }

  // ✅ NEW: Obtenir mon badge (envoi mail)
  sendBadge(idUser: number, idClub: number): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/badge/${idUser}/${idClub}`,
      {},
      {
        headers: this.getHeaders(),
        responseType: 'text'
      }
    );
  }
}