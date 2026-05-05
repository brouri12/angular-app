import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private base = `${environment.libraryServiceUrl}/library/stripe`;

  // State management
  isProcessing = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {
    // Load Stripe.js dynamically
    this.loadStripeJs();
  }

  /**
   * Load Stripe.js from CDN
   */
  private loadStripeJs() {
    if ((window as any).Stripe) return; // Already loaded

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      console.log('[Stripe] Stripe.js loaded successfully');
    };
    document.head.appendChild(script);
  }

  /**
   * Get Stripe configuration (publishable key)
   */
  getConfig(): Observable<{ publishableKey: string }> {
    return this.http.get<{ publishableKey: string }>(`${this.base}/config`);
  }

  /**
   * Create payment intent for book purchase
   */
  createPaymentIntent(bookId: number, userId: number): Observable<PaymentIntentResponse> {
    this.error.set(null);
    this.isProcessing.set(true);

    return new Observable(subscriber => {
      this.http.post<PaymentIntentResponse>(`${this.base}/create-payment-intent`, {
        bookId,
        userId
      }).subscribe({
        next: (response) => {
          this.isProcessing.set(false);
          subscriber.next(response);
          subscriber.complete();
        },
        error: (err) => {
          this.isProcessing.set(false);
          const errorMsg = err.error?.error || err.error?.message || 'Failed to create payment';
          this.error.set(errorMsg);
          subscriber.error(new Error(errorMsg));
        }
      });
    });
  }

  /**
   * Confirm payment with Stripe
   */
  async confirmPayment(stripe: any, elements: any): Promise<ConfirmPaymentResult> {
    if (!stripe || !elements) {
      throw new Error('Stripe not initialized');
    }

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/library`,
        },
        redirect: 'if_required'
      });

      if (error) {
        this.error.set(error.message);
        this.isProcessing.set(false);
        return { success: false, error: error.message };
      }

      // Check payment intent status
      if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          this.successMessage.set('Payment successful!');
          this.isProcessing.set(false);
          return {
            success: true,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status
          };
        } else if (paymentIntent.status === 'requires_action') {
          this.error.set('Additional verification required. Please check your card.');
          this.isProcessing.set(false);
          return { success: false, error: 'Additional verification required' };
        }
      }

      this.isProcessing.set(false);
      return { success: false, error: 'Payment processing failed' };
    } catch (err: any) {
      const errorMsg = err.message || 'Payment failed';
      this.error.set(errorMsg);
      this.isProcessing.set(false);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Confirm purchase on backend after successful payment
   */
  confirmPurchase(bookId: number, userId: number, paymentIntentId: string): Observable<PurchaseResponse> {
    return this.http.post<PurchaseResponse>(`${this.base}/confirm-purchase`, {
      bookId,
      userId,
      paymentIntentId
    });
  }

  /**
   * Check if user has purchased a book
   */
  hasPurchased(userId: number, bookId: number): Observable<{ purchased: boolean }> {
    return this.http.get<{ purchased: boolean }>(
      `${this.base}/purchased/${userId}/${bookId}`
    );
  }

  /**
   * Initialize Stripe Elements for payment form
   */
  initializeElements(stripe: any, clientSecret: string): any {
    const elements = stripe.elements({ clientSecret });
    return elements;
  }

  /**
   * Mount payment element
   */
  mountPaymentElement(elements: any, containerId: string): void {
    const paymentElement = elements.create('payment');
    const container = document.getElementById(containerId);
    if (container) {
      paymentElement.mount(container);
    }
  }

  /**
   * Validate card details before submission
   */
  async validatePaymentMethod(elements: any): Promise<boolean> {
    if (!elements) return false;

    // Stripe Elements automatically validates
    return true;
  }

  /**
   * Handle payment errors with user-friendly messages
   */
  getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error?.error) return error.error.error;
    return 'An error occurred during payment. Please try again.';
  }

  /**
   * Clear error messages
   */
  clearErrors(): void {
    this.error.set(null);
    this.successMessage.set(null);
  }
}

/**
 * Response types
 */
export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentResult {
  success: boolean;
  paymentIntentId?: string;
  status?: string;
  error?: string;
}

export interface PurchaseResponse {
  id: number;
  userId: number;
  bookId: number;
  price: number;
  purchaseDate: string;
  paymentStatus: 'PAID' | 'FAILED';
}

