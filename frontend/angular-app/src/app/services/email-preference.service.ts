import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailPreferenceDTO {
  userId: number;
  welcomeEmails: boolean;
  replyNotifications: boolean;
  weeklyDigests: boolean;
  mentionAlerts: boolean;
  dailySummaries: boolean;
  unreadReminders: boolean;
  unsubscribeAll: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmailPreferenceService {
  private apiUrl = 'http://localhost:8082/api/forum/email';

  constructor(private http: HttpClient) {}

  getPreferences(userId: number): Observable<EmailPreferenceDTO> {
    return this.http.get<EmailPreferenceDTO>(`${this.apiUrl}/preferences/${userId}`);
  }

  createPreferences(preferences: EmailPreferenceDTO): Observable<EmailPreferenceDTO> {
    return this.http.post<EmailPreferenceDTO>(`${this.apiUrl}/preferences`, preferences);
  }

  updatePreferences(userId: number, preferences: EmailPreferenceDTO): Observable<EmailPreferenceDTO> {
    return this.http.put<EmailPreferenceDTO>(`${this.apiUrl}/preferences/${userId}`, preferences);
  }

  getDefaultPreferences(userId: number): EmailPreferenceDTO {
    return {
      userId,
      welcomeEmails: true,
      replyNotifications: true,
      weeklyDigests: true,
      mentionAlerts: true,
      dailySummaries: false,
      unreadReminders: true,
      unsubscribeAll: false
    };
  }
}
