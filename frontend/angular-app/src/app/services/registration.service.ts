import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private baseUrl = 'http://localhost:8888/registrations';
  private eventUrl = 'http://localhost:8888/events';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  createRegistration(payload: { eventId: number; userId: number; status?: string }): Observable<any> {
    return this.http.post(this.baseUrl, payload, { headers: this.getHeaders() });
  }

  getRegistrationsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/by-user/${userId}`, { headers: this.getHeaders() });
  }

  getAllRegistrations(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getRegistrationsByEventId(eventId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/event/${eventId}`, { headers: this.getHeaders() });
  }

  deleteRegistration(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  getEventById(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.eventUrl}/${eventId}`, { headers: this.getHeaders() });
  }

  sponsorEvent(eventId: number, clubId: number): Observable<any> {
    return this.http.put<any>(
      `${this.eventUrl}/${eventId}/sponsor?clubId=${clubId}`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
