import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Priorite {
  value: string;
  label: string;
}

export interface CategorieReclamation {
  value: string;
  label: string;
}

export const PRIORITES: Priorite[] = [
  { value: 'BASSE', label: 'Basse' },
  { value: 'MOYENNE', label: 'Moyenne' },
  { value: 'HAUTE', label: 'Haute' },
  { value: 'CRITIQUE', label: 'Critique' }
];

export const CATEGORIES: CategorieReclamation[] = [
  { value: 'TECHNIQUE', label: 'Technique' },
  { value: 'FACTURATION', label: 'Facturation' },
  { value: 'QUALITE', label: 'Qualité' },
  { value: 'ADMINISTRATIF', label: 'Administratif' },
  { value: 'AUTRE', label: 'Autre' }
];

export interface Reclamation {
  id?: number;
  userId?: number;
  objet: string;
  description?: string;
  status?: string;
  priorite?: string;
  categorie?: string;
  date?: string;
}

export interface ReclamationWithUser extends Reclamation {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface ReclamationAnalytics {
  totalReclamations: number;
  parStatus: { [key: string]: number };
  parPriorite: { [key: string]: number };
  parCategorie: { [key: string]: number };
  reclamationEnAttente?: number;
  reclamationResolue?: number;
  tempsResolutionMoyen?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8082/api/reclamations';
  private reportsUrl = 'http://localhost:8082/api/reports';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getByUserId(userId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}?userId=${userId}`, { headers: this.getHeaders() });
  }

  getByStatus(status: string): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}?status=${status}`, { headers: this.getHeaders() });
  }

  getByPriorite(priorite: string): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}?priorite=${priorite}`, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getAllWithUser(): Observable<ReclamationWithUser[]> {
    return this.http.get<ReclamationWithUser[]>(`${this.apiUrl}/with-user`, { headers: this.getHeaders() });
  }

  getByIdWithUser(id: number): Observable<ReclamationWithUser> {
    return this.http.get<ReclamationWithUser>(`${this.apiUrl}/${id}/with-user`, { headers: this.getHeaders() });
  }

  getAnalytics(): Observable<ReclamationAnalytics> {
    return this.http.get<ReclamationAnalytics>(`${this.apiUrl}/analytics`, { headers: this.getHeaders() });
  }

  getAnalyticsByPeriod(dateDebut: string, dateFin: string): Observable<ReclamationAnalytics> {
    return this.http.get<ReclamationAnalytics>(
      `${this.apiUrl}/analytics?dateDebut=${dateDebut}&dateFin=${dateFin}`, 
      { headers: this.getHeaders() }
    );
  }

  create(reclamation: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, reclamation, { headers: this.getHeaders() });
  }

  update(id: number, reclamation: Reclamation): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}`, reclamation, { headers: this.getHeaders() });
  }

  updateStatus(id: number, status: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  updatePriorite(id: number, priorite: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}/priorite`, { priorite }, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  downloadReclamationsPdf(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/reclamations/pdf`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  downloadReclamationsExcel(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/reclamations/excel`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }
}

