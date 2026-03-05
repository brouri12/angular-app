import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({ providedIn: 'root' })
export class ClubService {
  private baseUrl = 'http://localhost:8089/clubs'; // ✅ change port si besoin

  constructor(private http: HttpClient) {}

  getAll(): Observable<Club[]> {
    return this.http.get<Club[]>(this.baseUrl);
  }

  getById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.baseUrl}/${id}`);
  }

  create(club: Club): Observable<Club> {
    return this.http.post<Club>(this.baseUrl, club);
  }

  update(id: number, club: Club): Observable<Club> {
    return this.http.put<Club>(`${this.baseUrl}/${id}`, club);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadLogo(id: number, file: File): Observable<Club> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Club>(`${this.baseUrl}/${id}/logo`, form);
  }

  logoUrl(id: number): string {
    return `${this.baseUrl}/${id}/logo`;
  }
}
