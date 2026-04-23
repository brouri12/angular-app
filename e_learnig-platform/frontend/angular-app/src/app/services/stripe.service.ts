import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private apiUrl = 'http://localhost:8888/user-service/api/payments';
  
  // Test publishable key - replace with your actual key
  private publishableKey = 'pk_test_51T4T13CmhqMbGh2rgELLpfm9qBwyRj8CrJTISITJkWaPLmZk1mYj7zO55JNIEpq38yWPaiMWxIVnkMOLaixK0FGB00RGj3bUrQ';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.stripePromise = loadStripe(this.publishableKey);
  }

  async getStripe(): Promise<Stripe | null> {
    return await this.stripePromise;
  }

  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/create-payment-intent`, 
      { amount, currency }, 
      { headers }
    );
  }
}
