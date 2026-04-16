import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SubscriptionService {
  id: number;
  name: string;
  price: number;
  duration: number;
}

export interface UserSubscription {
  id: number;
  userId: number;
  serviceId: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  autoRenew: boolean;
}

/**
 * Simplified Subscription Service for demo purposes
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  
  constructor() {}

  /**
   * Get current user subscription
   */
  getCurrentSubscription(): Observable<UserSubscription | null> {
    return of(null);
  }

  /**
   * Get subscription history
   */
  getSubscriptionHistory(): Observable<UserSubscription[]> {
    return of([]);
  }

  /**
   * Update subscription auto-renew
   */
  updateAutoRenew(subscriptionId: number, autoRenew: boolean): Observable<UserSubscription> {
    const mockSubscription: UserSubscription = {
      id: subscriptionId,
      userId: 1,
      serviceId: 1,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
      autoRenew: autoRenew
    };
    return of(mockSubscription);
  }

  /**
   * Cancel subscription
   */
  cancelSubscription(subscriptionId: number): Observable<UserSubscription> {
    const mockSubscription: UserSubscription = {
      id: subscriptionId,
      userId: 1,
      serviceId: 1,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'CANCELLED',
      autoRenew: false
    };
    return of(mockSubscription);
  }
}
