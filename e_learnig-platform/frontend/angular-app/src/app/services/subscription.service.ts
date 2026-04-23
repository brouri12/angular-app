import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserSubscription {
  id: number;
  userId: number;
  abonnementId: number;
  abonnementName: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'SUSPENDED';
  autoRenew: boolean;
  paymentId: number;
  price: number;
  billingCycle: string;
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  daysRemaining: number;
  isActive: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  progressPercentage: number;
}

export interface SubscriptionActionRequest {
  reason?: string;
  autoRenew?: boolean;
  newAbonnementId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:8888/user-service/api/subscriptions';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCurrentSubscription(): Observable<UserSubscription> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<UserSubscription>(`${this.apiUrl}/current`, { headers });
  }

  getSubscriptionHistory(): Observable<UserSubscription[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<UserSubscription[]>(`${this.apiUrl}/history`, { headers });
  }

  hasActiveSubscription(): Observable<boolean> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<boolean>(`${this.apiUrl}/has-active`, { headers });
  }

  cancelSubscription(reason: string): Observable<UserSubscription> {
    const headers = this.authService.getAuthHeaders();
    const request: SubscriptionActionRequest = { reason };
    return this.http.post<UserSubscription>(`${this.apiUrl}/cancel`, request, { headers });
  }

  toggleAutoRenew(autoRenew: boolean): Observable<UserSubscription> {
    const headers = this.authService.getAuthHeaders();
    const request: SubscriptionActionRequest = { autoRenew };
    return this.http.patch<UserSubscription>(`${this.apiUrl}/auto-renew`, request, { headers });
  }
}
