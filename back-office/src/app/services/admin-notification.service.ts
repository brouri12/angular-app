import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface AdminNotification {
  id: number;
  message: string;
  totalEnAttente: number;
  offreId: number;
  offreTitre: string;
  createdAt: string;
  lu: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminNotificationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8083/api/recrutement/notifications';

  notifications = signal<AdminNotification[]>([]);
  unreadCount = signal<number>(0);

  constructor() {
    // Start polling immediately when service is created — every 10 seconds
    timer(0, 10000).pipe(
      switchMap(() =>
        this.http.get<AdminNotification[]>(`${this.apiUrl}/unread`).pipe(
          catchError(() => of([] as AdminNotification[]))
        )
      )
    ).subscribe(data => {
      this.notifications.set(data);
      this.unreadCount.set(data.length);
    });
  }

  markAsRead(id: number) {
    this.http.patch(`${this.apiUrl}/${id}/read`, {}).subscribe(() => {
      this.notifications.update(list => list.filter(n => n.id !== id));
      this.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  markAllAsRead() {
    this.http.patch(`${this.apiUrl}/read-all`, {}).subscribe(() => {
      this.notifications.set([]);
      this.unreadCount.set(0);
    });
  }
}
