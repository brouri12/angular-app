import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import type { UserProgress } from '../../shared/models/pronunciation.types';

@Injectable({
  providedIn: 'root'
})
export class StudentFeedbackDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // EXISTING FEEDBACK METHODS (NO CHANGE)
  getFeedbackStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/feedbacks/stats`);
  }

  getRecentFeedbacks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/feedbacks/recent`);
  }

  // EXISTING RECLAMATION METHODS (NO CHANGE)
  getReclamationStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reclamations/stats`);
  }

  // 🚀 NEW PRONUNCIATION PROGRESS (PHASE 1.4)
  getPronunciationProgress(): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.apiUrl}/pronunciation/progress`);
  }

  getRecentRecordings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pronunciation/recordings/recent`);
  }

  getPronunciationStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/pronunciation/stats`);
  }
}

