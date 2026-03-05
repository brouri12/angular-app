import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event  } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventsService {

  private API = 'http://localhost:8082/events'; // ⚠️ change port si besoin

  constructor(private http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.API);
  }

  create(ev: Event){
    return this.http.post<Event>(this.API, ev);
  }

  delete(id:number){
    return this.http.delete(`${this.API}/${id}`);
  }

  decrement(id:number){
    return this.http.put(`${this.API}/${id}/capacity/decrement`, {});
  }

  increment(id:number){
    return this.http.put(`${this.API}/${id}/capacity/increment`, {});
  }
}
