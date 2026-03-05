import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface RegistrationPayload {
  eventId: number;
  userId: number;
  registrationDate?: string;
  status?: 'CONFIRMED' | 'CANCELED' | 'PENDING';
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {

  private baseUrl = 'http://localhost:8083/registrations';
  private eventUrl = 'http://localhost:8082/events';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  createRegistration(payload: { eventId: number; userId: number }): Observable<any> {
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
}