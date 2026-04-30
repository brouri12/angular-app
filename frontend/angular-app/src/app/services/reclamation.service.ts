import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Types pour les constantes
export interface Priorite {
  value: string;
  label: string;
}

export interface CategorieReclamation {
  value: string;
  label: string;
}

// Constantes
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

  // GET /api/reclamations - Liste toutes les réclamations
  getAll(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // GET /api/reclamations?userId=X - Réclamations par utilisateur
  getByUserId(userId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}?userId=${userId}`, { headers: this.getHeaders() });
  }

  // GET /api/reclamations?status=X - Réclamations par statut
  getByStatus(status: string): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}?status=${status}`, { headers: this.getHeaders() });
  }

  // GET /api/reclamations?priorite=X - Réclamations par priorité
  getByPriorite(priorite: string): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}?priorite=${priorite}`, { headers: this.getHeaders() });
  }

  // GET /api/reclamations/{id} - Réclamation par ID
  getById(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // GET /api/reclamations/with-user - Toutes les réclamations avec infos utilisateur
  getAllWithUser(): Observable<ReclamationWithUser[]> {
    return this.http.get<ReclamationWithUser[]>(`${this.apiUrl}/with-user`, { headers: this.getHeaders() });
  }

  // GET /api/reclamations/{id}/with-user - Réclamation avec infos utilisateur
  getByIdWithUser(id: number): Observable<ReclamationWithUser> {
    return this.http.get<ReclamationWithUser>(`${this.apiUrl}/${id}/with-user`, { headers: this.getHeaders() });
  }

  // GET /api/reclamations/analytics - Analytics des réclamations
  getAnalytics(): Observable<ReclamationAnalytics> {
    return this.http.get<ReclamationAnalytics>(`${this.apiUrl}/analytics`, { headers: this.getHeaders() });
  }

  // GET /api/reclamations/analytics?dateDebut=X&dateFin=X - Analytics par période
  getAnalyticsByPeriod(dateDebut: string, dateFin: string): Observable<ReclamationAnalytics> {
    return this.http.get<ReclamationAnalytics>(
      `${this.apiUrl}/analytics?dateDebut=${dateDebut}&dateFin=${dateFin}`, 
      { headers: this.getHeaders() }
    );
  }

  // POST /api/reclamations - Créer une réclamation
  create(reclamation: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, reclamation, { headers: this.getHeaders() });
  }

  // PUT /api/reclamations/{id} - Modifier une réclamation
  update(id: number, reclamation: Reclamation): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}`, reclamation, { headers: this.getHeaders() });
  }

  // PUT /api/reclamations/{id}/status - Modifier le statut
  updateStatus(id: number, status: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  // PUT /api/reclamations/{id}/priorite - Modifier la priorité
  updatePriorite(id: number, priorite: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}/priorite`, { priorite }, { headers: this.getHeaders() });
  }

  // DELETE /api/reclamations/{id} - Supprimer une réclamation
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ===== RAPPORTS =====

  // GET /api/reports/reclamations/pdf - Télécharger PDF
  downloadReclamationsPdf(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/reclamations/pdf`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  // GET /api/reports/reclamations/excel - Télécharger Excel
  downloadReclamationsExcel(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/reclamations/excel`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }
}
