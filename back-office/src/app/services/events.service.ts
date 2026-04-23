import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8888/events';

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.baseUrl);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.baseUrl}/${id}`);
  }

  create(payload: Event): Observable<Event> {
    return this.http.post<Event>(this.baseUrl, payload);
  }

  update(id: number, payload: Event): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/${id}`, payload);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  totalEvents(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/stats/total`);
  }

  statsByStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stats/status`);
  }

  statsByType(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stats/type`);
  }

  statsByMode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stats/mode`);
  }
}
