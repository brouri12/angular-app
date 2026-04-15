import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({ providedIn: 'root' })
export class ClubService {
  private baseUrl = 'http://localhost:8888/clubs';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getAll(): Observable<Club[]> {
    return this.http.get<Club[]>(this.baseUrl, { headers: this.authHeaders() });
  }

  getById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  create(club: Club): Observable<Club> {
    return this.http.post<Club>(this.baseUrl, club, { headers: this.authHeaders() });
  }

  update(id: number, club: Club): Observable<Club> {
    return this.http.put<Club>(`${this.baseUrl}/${id}`, club, { headers: this.authHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }

  uploadLogo(id: number, file: File): Observable<Club> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Club>(`${this.baseUrl}/${id}/logo`, form, { headers: this.authHeaders() });
  }

  logoUrl(id: number): string {
    return `${this.baseUrl}/${id}/logo`;
  }
}
