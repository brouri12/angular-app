import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = API_BASE_URL;

  constructor(private http: HttpClient) {}

  getCourses(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}${API_ENDPOINTS.courses}`);
  }

  getStudents(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}${API_ENDPOINTS.students}`);
  }

  getEnrollments(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}${API_ENDPOINTS.enrollments}`);
  }

  getBadges(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}${API_ENDPOINTS.badges}`);
  }

  getDatabaseInfo(): Observable<unknown> {
    return this.http.get<unknown>(`${this.base}${API_ENDPOINTS.databaseInfo}`);
  }

  getAdminReviewsOverview(top = 8, recent = 10): Observable<unknown> {
    const primaryUrl = `${this.base}${API_ENDPOINTS.adminReviewsOverview}?top=${top}&recent=${recent}`;
    const fallbackUrl = `http://localhost:8083${API_ENDPOINTS.adminReviewsOverview}?top=${top}&recent=${recent}`;
    return this.http.get<unknown>(primaryUrl).pipe(
      catchError(() => this.http.get<unknown>(fallbackUrl))
    );
  }
}
