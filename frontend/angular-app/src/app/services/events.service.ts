import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {

  private API = 'http://localhost:8082/events';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.API);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.API}/${id}`);
  }

  create(ev: Event): Observable<Event> {
    return this.http.post<Event>(this.API, ev);
  }

  update(id: number, ev: Event): Observable<Event> {
    return this.http.put<Event>(`${this.API}/${id}`, ev);
  }

  delete(id: number) {
    return this.http.delete(`${this.API}/${id}`);
  }

  decrement(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.API}/${id}/capacity/decrement`, {});
  }

  increment(id: number): Observable<Event> {
    return this.http.put<Event>(`${this.API}/${id}/capacity/increment`, {});
  }
}