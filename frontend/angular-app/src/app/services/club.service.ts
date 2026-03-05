import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ClubType = 'ONLINE' | 'PRESENTIEL';

export interface Club {
  idClub?: number;
  nomClub: string;
  description?: string;
  type: ClubType;
  ville?: string;
  dateCreation?: string; // "yyyy-MM-dd" ou ISO
  logo?: string;
}

@Injectable({ providedIn: 'root' })
export class ClubService {

  // ✅ API Gateway
  private baseUrl = 'http://localhost:8089/clubs';

  constructor(private http: HttpClient) {}

  // ✅ Ajoute le token à chaque requête (sans modifier auth.service.ts)
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // ================= CRUD =================

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

  deleteByName(nomClub: string): Observable<string> {
    const params = new HttpParams().set('nomClub', nomClub);
    return this.http.delete(`${this.baseUrl}/by-name`, {
      params,
      responseType: 'text',
      headers: this.authHeaders()
    });
  }

  // ================= FILTERS =================

  byType(type: ClubType): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.baseUrl}/type/${type}`, { headers: this.authHeaders() });
  }

  byVille(ville: string): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.baseUrl}/ville/${ville}`, { headers: this.authHeaders() });
  }

  // ================= LOGO =================

  createWithLogo(data: {
    nomClub: string;
    description?: string;
    type: ClubType;
    ville?: string;
    file?: File | null;
  }): Observable<Club> {
    const form = new FormData();
    form.append('nomClub', data.nomClub);
    if (data.description) form.append('description', data.description);
    form.append('type', data.type);
    if (data.ville) form.append('ville', data.ville);
    if (data.file) form.append('file', data.file);

    return this.http.post<Club>(`${this.baseUrl}/create-with-logo`, form, {
      headers: this.authHeaders()
    });
  }

  uploadLogo(id: number, file: File): Observable<Club> {
    const form = new FormData();
    form.append('file', file);

    return this.http.post<Club>(`${this.baseUrl}/${id}/logo`, form, {
      headers: this.authHeaders()
    });
  }

  getLogoBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/logo`, {
      responseType: 'blob',
      headers: this.authHeaders()
    });
  }

  // ✅ Pour affichage <img>
  logoUrl(id: number): string {
    // si ton backend protège /logo aussi, <img> ne peut pas envoyer Authorization !
    // => soit rendre /logo public côté backend, soit afficher via blob (solution plus bas si tu veux)
    return `${this.baseUrl}/${id}/logo`;
  }

  // ================= BADGE / QR =================
  requestBadge(clubId: number, email: string, fullName: string): Observable<string> {
    const url = `${this.baseUrl}/${clubId}/badge`;
    const params = new HttpParams().set('email', email).set('fullName', fullName);

    return this.http.post(url, null, {
      params,
      responseType: 'text',
      headers: this.authHeaders()
    });
  }
}