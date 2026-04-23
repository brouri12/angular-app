import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay, finalize } from 'rxjs/operators';

export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED';

export interface Registration {
  idRegistration: number;
  eventId: number;
  userId: number;
  nom?: string;
  prenom?: string;
  registrationDate?: string;
  status: RegistrationStatus;
  eventTitle?: string;
  userName?: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationAdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8888/registrations';
  private readonly eventUrl = 'http://localhost:8888/events';
  private readonly userUrl = 'http://localhost:8888/user-service/api/users';

  private eventTitleCache = new Map<number, string>();
  private eventTitleInFlight = new Map<number, Observable<string>>();
  private userNameCache = new Map<number, string>();
  private userNameInFlight = new Map<number, Observable<string>>();

  getAll(): Observable<Registration[]> {
    return this.http.get<Registration[]>(this.baseUrl);
  }

  getById(id: number): Observable<Registration> {
    return this.http.get<Registration>(`${this.baseUrl}/${id}`);
  }

  update(id: number, body: Partial<Registration>): Observable<Registration> {
    return this.http.put<Registration>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getEventTitleById(eventId: number): Observable<string> {
    if (!eventId || eventId <= 0) return of('Unknown Event');
    const cached = this.eventTitleCache.get(eventId);
    if (cached) return of(cached);
    const inflight = this.eventTitleInFlight.get(eventId);
    if (inflight) return inflight;
    const req$ = this.http.get<any>(`${this.eventUrl}/${eventId}`).pipe(
      map(ev => {
        const title = (ev?.title ?? ev?.name ?? `Event #${eventId}`).toString().trim();
        this.eventTitleCache.set(eventId, title);
        return title;
      }),
      catchError(() => of(`Event #${eventId}`)),
      finalize(() => this.eventTitleInFlight.delete(eventId)),
      shareReplay(1)
    );
    this.eventTitleInFlight.set(eventId, req$);
    return req$;
  }

  getUserNameById(userId: number): Observable<string> {
    if (!userId || userId <= 0) return of('Unknown User');
    const cached = this.userNameCache.get(userId);
    if (cached) return of(cached);
    const inflight = this.userNameInFlight.get(userId);
    if (inflight) return inflight;
    const req$ = this.http.get<any>(`${this.userUrl}/${userId}/public-name`).pipe(
      map(res => {
        const name = res?.displayName || `User #${userId}`;
        this.userNameCache.set(userId, name);
        return name;
      }),
      catchError(() => of(`User #${userId}`)),
      finalize(() => this.userNameInFlight.delete(userId)),
      shareReplay(1)
    );
    this.userNameInFlight.set(userId, req$);
    return req$;
  }
}
