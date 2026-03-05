import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventModel } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private readonly baseUrl = 'http://localhost:8082/events';

  constructor(private http: HttpClient) {}

  // ✅ GET /events
  getAll(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(this.baseUrl);
  }

  // ✅ GET /events/{id}
  getById(id: number): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.baseUrl}/${id}`);
  }

  // ✅ POST /events
  create(payload: EventModel): Observable<EventModel> {
    return this.http.post<EventModel>(this.baseUrl, payload);
  }

  // ✅ PUT /events/{id}
  update(id: number, payload: EventModel): Observable<EventModel> {
    return this.http.put<EventModel>(`${this.baseUrl}/${id}`, payload);
  }

  // ✅ DELETE /events/{id}
  deleteById(id: number) {
  return this.http.delete<void>(`${this.baseUrl}/${id}`);
}

}
