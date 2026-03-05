import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay, finalize } from 'rxjs/operators';
import { AuthService } from './auth.service'; // ✅ adapte le path si besoin

export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED';

export interface Registration {
  idRegistration: number;
  eventId: number;
  userId: number;
  registrationDate?: string;
  status: RegistrationStatus;

  // front only
  eventTitle?: string;
  userName?: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly baseUrl = 'http://localhost:8083/registrations';
  private readonly eventUrl = 'http://localhost:8082/events';

  // ✅ User service via gateway
  private readonly userUrl = 'http://localhost:8888/user-service/api/users';

  private eventTitleCache = new Map<number, string>();
  private eventTitleInFlight = new Map<number, Observable<string>>();

  private userNameCache = new Map<number, string>();
  private userNameInFlight = new Map<number, Observable<string>>();

  constructor(private http: HttpClient, private auth: AuthService) {}

  getAll(): Observable<Registration[]> {
    return this.http.get<Registration[]>(this.baseUrl);
  }

  getByEvent(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.baseUrl}/event/${eventId}`);
  }

  getById(id: number): Observable<Registration> {
    return this.http.get<Registration>(`${this.baseUrl}/${id}`);
  }

  create(payload: { eventId: number; userId: number }): Observable<Registration> {
    return this.http.post<Registration>(this.baseUrl, payload);
  }

  update(id: number, body: Partial<Registration>): Observable<Registration> {
    return this.http.put<Registration>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ✅ Event title avec cache
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

  // ✅ User name avec cache + Bearer header (sans toucher interceptor)
  getUserNameById(userId: number): Observable<string> {
    if (!userId || userId <= 0) return of('Unknown User');

    const cached = this.userNameCache.get(userId);
    if (cached) return of(cached);

    const inflight = this.userNameInFlight.get(userId);
    if (inflight) return inflight;

    const headers = this.auth.getAuthHeaders(); // ✅ Bearer token

    const req$ = this.http.get<any>(`${this.userUrl}/${userId}`, { headers }).pipe(
      map(u => {
        const full =
          (u?.name) ||
          ([u?.prenom, u?.nom].filter(Boolean).join(' ').trim()) ||
          u?.username ||
          `User #${userId}`;

        const result = String(full).trim() || `User #${userId}`;
        this.userNameCache.set(userId, result);
        return result;
      }),
      catchError(() => of(`User #${userId}`)),
      finalize(() => this.userNameInFlight.delete(userId)),
      shareReplay(1)
    );

    this.userNameInFlight.set(userId, req$);
    return req$;
  }

  clearCaches() {
    this.eventTitleCache.clear();
    this.eventTitleInFlight.clear();
    this.userNameCache.clear();
    this.userNameInFlight.clear();
  }
}