import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Feedback {
  id?: number;
  userId?: number;
  moduleId?: number;
  note: number;
  commentaire?: string;
  sentiment?: 'POSITIF' | 'NEGATIF' | 'NEUTRE';
  date?: string;
}

export interface FeedbackWithUser extends Feedback {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface FeedbackStats {
  totalFeedbacks: number;
  noteMoyenne: number;
  totalPositif: number;
  totalNegatif: number;
  totalNeutre: number;
  nouveauxAujourdhui?: number;
  moyenneNote?: number;
  repartitionNotes?: { [key: string]: number };
}

export interface SentimentStats {
  positif: number;
  negatif: number;
  neutre: number;
  pourcentagePositifs?: number;
  pourcentageNeutres?: number;
  pourcentageNegatifs?: number;
  totalPositifs?: number;
  totalNeutres?: number;
  totalNegatifs?: number;
  repartitionParSentiment?: { [key: string]: number };
  motsNegatifsFrequents?: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8082/api/feedbacks';
  private reportsUrl = 'http://localhost:8082/api/reports';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // GET /api/feedbacks - Liste tous les feedbacks
  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks?userId=X - Feedbacks par utilisateur
  getByUserId(userId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}?userId=${userId}`, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks?moduleId=X - Feedbacks par module
  getByModuleId(moduleId: number): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.apiUrl}?moduleId=${moduleId}`, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks/{id} - Feedback par ID
  getById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks/with-user - Tous les feedbacks avec infos utilisateur
  getAllWithUser(): Observable<FeedbackWithUser[]> {
    return this.http.get<FeedbackWithUser[]>(`${this.apiUrl}/with-user`, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks/{id}/with-user - Feedback avec infos utilisateur
  getByIdWithUser(id: number): Observable<FeedbackWithUser> {
    return this.http.get<FeedbackWithUser>(`${this.apiUrl}/${id}/with-user`, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks/stats - Statistiques globales
  getStats(): Observable<FeedbackStats> {
    return this.http.get<FeedbackStats>(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks/stats?moduleId=X - Statistiques par module
  getStatsByModule(moduleId: number): Observable<FeedbackStats> {
    return this.http.get<FeedbackStats>(`${this.apiUrl}/stats?moduleId=${moduleId}`, { headers: this.getHeaders() });
  }

  // GET /api/feedbacks/sentiment-stats - Statistiques des sentiments
  getSentimentStats(): Observable<SentimentStats> {
    return this.http.get<SentimentStats>(`${this.apiUrl}/sentiment-stats`, { headers: this.getHeaders() });
  }

  // POST /api/feedbacks - Créer un feedback
  create(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(this.apiUrl, feedback, { headers: this.getHeaders() });
  }

  // PUT /api/feedbacks/{id} - Modifier un feedback
  update(id: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.apiUrl}/${id}`, feedback, { headers: this.getHeaders() });
  }

  // DELETE /api/feedbacks/{id} - Supprimer un feedback
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ===== RAPPORTS =====

  // GET /api/reports/feedbacks/pdf - Télécharger PDF
  downloadFeedbacksPdf(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/feedbacks/pdf`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  // GET /api/reports/feedbacks/excel - Télécharger Excel
  downloadFeedbacksExcel(): Observable<Blob> {
    return this.http.get(`${this.reportsUrl}/feedbacks/excel`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }
}
