import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Badge {
  id?: number;
  name: string;
  description: string;
  imageUrl?: string;
  criteria: string;
  points: number;
  category: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  createdAt?: Date;
}

export interface UserBadge {
  id?: number;
  badgeId: number;
  userId: string;
  earnedAt: Date;
  badge?: Badge;
}

export interface BadgeCriteria {
  type: 'QUIZ_COMPLETION' | 'FORMATION_COMPLETION' | 'SCORE_THRESHOLD' | 'STREAK' | 'CUSTOM';
  targetId?: number;
  requiredValue: number;
  currentValue?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  private apiUrl = `${environment.apiUrl}/api/badges`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ========== BADGES ==========
  
  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getBadgeById(id: number): Observable<Badge> {
    return this.http.get<Badge>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getBadgesByCategory(category: string): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.apiUrl}/category/${category}`, { headers: this.getHeaders() });
  }

  getBadgesByRarity(rarity: string): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${this.apiUrl}/rarity/${rarity}`, { headers: this.getHeaders() });
  }

  createBadge(badge: Badge): Observable<Badge> {
    return this.http.post<Badge>(this.apiUrl, badge, { headers: this.getHeaders() });
  }

  updateBadge(id: number, badge: Badge): Observable<Badge> {
    return this.http.put<Badge>(`${this.apiUrl}/${id}`, badge, { headers: this.getHeaders() });
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ========== USER BADGES ==========
  
  getMyBadges(): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.apiUrl}/my-badges`, { headers: this.getHeaders() });
  }

  getUserBadges(userId: string): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  awardBadge(userId: string, badgeId: number): Observable<UserBadge> {
    return this.http.post<UserBadge>(`${this.apiUrl}/${badgeId}/award`, { userId }, { headers: this.getHeaders() });
  }

  // ========== CERTIFICATE ==========
  
  downloadCertificate(badgeId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${badgeId}/certificate`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  getCertificateUrl(badgeId: number): string {
    return `${this.apiUrl}/${badgeId}/certificate`;
  }

  // ========== PROGRESS ==========
  
  getBadgeProgress(badgeId: number): Observable<BadgeCriteria> {
    return this.http.get<BadgeCriteria>(`${this.apiUrl}/${badgeId}/progress`, { headers: this.getHeaders() });
  }

  getMyBadgeStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-statistics`, { headers: this.getHeaders() });
  }

  // ========== LEADERBOARD ==========
  
  getBadgeLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaderboard`, { headers: this.getHeaders() });
  }
}
