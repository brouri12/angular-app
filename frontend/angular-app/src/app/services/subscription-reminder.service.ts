import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { tap, switchMap, startWith } from 'rxjs/operators';
import { SubscriptionReminder } from '../models/subscription-reminder.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionReminderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8888/abonnement-service/api/subscription-reminders';
  
  reminders = signal<SubscriptionReminder[]>([]);
  reminderCount = signal<number>(0);
  
  getUserReminders(userId: number): Observable<SubscriptionReminder[]> {
    return this.http.get<SubscriptionReminder[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(reminders => {
        if (reminders.length === 0) {
          console.log(`✓ No subscription reminders for user ${userId}`);
        } else {
          console.log(`✓ Found ${reminders.length} subscription reminder(s) for user ${userId}`);
        }
        
        const enrichedReminders = reminders.map((r, index) => ({
          ...r,
          id: `${r.userId}-${r.reminderType}-${index}`,
          isRead: false,
          severity: this.getSeverity(r.reminderType)
        }));
        this.reminders.set(enrichedReminders);
        this.reminderCount.set(enrichedReminders.length);
      })
    );
  }
  
  getUserReminderCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/count`).pipe(
      tap(count => this.reminderCount.set(count))
    );
  }
  
  getAllReminders(): Observable<SubscriptionReminder[]> {
    return this.http.get<SubscriptionReminder[]>(`${this.apiUrl}/all`);
  }
  
  dismissReminder(userId: number, reminderType: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/${userId}/dismiss/${reminderType}`).pipe(
      tap(() => {
        const updated = this.reminders().filter(r => r.reminderType !== reminderType);
        this.reminders.set(updated);
        this.reminderCount.set(updated.length);
      })
    );
  }
  
  checkNow(): Observable<SubscriptionReminder[]> {
    return this.http.post<SubscriptionReminder[]>(`${this.apiUrl}/check-now`, {});
  }
  
  startPolling(userId: number): Observable<SubscriptionReminder[]> {
    return interval(5 * 60 * 1000).pipe(
      startWith(0),
      switchMap(() => this.getUserReminders(userId))
    );
  }
  
  getSeverityColor(reminderType: string): string {
    switch (reminderType) {
      case 'EXPIRED':
        return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200';
      case 'EXPIRING_TODAY':
        return 'bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-200';
      case 'EXPIRING_SOON':
      default:
        return 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200';
    }
  }
  
  getSeverityIcon(reminderType: string): string {
    switch (reminderType) {
      case 'EXPIRED':
        return '❌';
      case 'EXPIRING_TODAY':
        return '⚠️';
      case 'EXPIRING_SOON':
      default:
        return '⏰';
    }
  }
  
  private getSeverity(reminderType: string): 'high' | 'medium' | 'low' {
    switch (reminderType) {
      case 'EXPIRED':
        return 'high';
      case 'EXPIRING_TODAY':
        return 'medium';
      case 'EXPIRING_SOON':
      default:
        return 'low';
    }
  }
}
