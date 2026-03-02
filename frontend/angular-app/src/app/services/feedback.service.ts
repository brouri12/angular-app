import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Feedback {
  id?: number;
  userId?: number;
  moduleId?: number;
  note: number;
  commentaire: string;
  date?: Date;
}

export interface FeedbackStats {
  totalFeedbacks: number;
  moyenneNote: number;
  nouveauxAujourdhui: number;
  repartitionNotes: { [key: string]: number } | { [key: number]: number };
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:8082/api/feedbacks';
  private reportUrl = 'http://localhost:8082/api/reports';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(this.apiUrl);
  }

  getById(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`);
  }

  create(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(this.apiUrl, feedback);
  }

  update(id: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<Feedback>(`${this.apiUrl}/${id}`, feedback);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Get feedback statistics */
  getStats(): Observable<FeedbackStats> {
    return this.http.get<FeedbackStats>(`${this.apiUrl}/stats`);
  }

  /** Download feedback report as PDF */
  downloadFeedbacksPdf(): Observable<Blob> {
    return this.http.get(`${this.reportUrl}/feedbacks/pdf`, {
      responseType: 'blob'
    });
  }

  /** Download feedback report as Excel */
  downloadFeedbacksExcel(): Observable<Blob> {
    return this.http.get(`${this.reportUrl}/feedbacks/excel`, {
      responseType: 'blob'
    });
  }
}
