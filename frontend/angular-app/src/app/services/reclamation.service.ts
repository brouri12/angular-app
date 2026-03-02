import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reclamation {
  id?: number;
  userId?: number;
  objet: string;
  description: string;
  status?: string;
  date?: Date;
}

export interface ReclamationAnalytics {
  totalReclamations: number;
  parStatus: { [key: string]: number };
  tempsResolutionMoyen: number;
  parMois: { [key: string]: number };
  nonResolues: Reclamation[];
  reclamationEnAttente: number;
  reclamationResolue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8082/api/reclamations';
  private reportUrl = 'http://localhost:8082/api/reports';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.apiUrl);
  }

  getById(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.apiUrl}/${id}`);
  }

  getByUserId(userId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}?userId=${userId}`);
  }

  create(reclamation: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, reclamation);
  }

  update(id: number, reclamation: Reclamation): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}`, reclamation);
  }

  updateStatus(id: number, status: string): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Get reclamation analytics */
  getAnalytics(dateDebut?: string, dateFin?: string): Observable<ReclamationAnalytics> {
    let params = new HttpParams();
    if (dateDebut) {
      params = params.set('dateDebut', dateDebut);
    }
    if (dateFin) {
      params = params.set('dateFin', dateFin);
    }
    return this.http.get<ReclamationAnalytics>(`${this.apiUrl}/analytics`, { params });
  }

  /** Download reclamation report as PDF */
  downloadReclamationsPdf(): Observable<Blob> {
    return this.http.get(`${this.reportUrl}/reclamations/pdf`, {
      responseType: 'blob'
    });
  }

  /** Download reclamation report as Excel */
  downloadReclamationsExcel(): Observable<Blob> {
    return this.http.get(`${this.reportUrl}/reclamations/excel`, {
      responseType: 'blob'
    });
  }
}
