import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  coverImageUrl: string;
  category: string;
  bookType: 'PHYSICAL' | 'PDF';
  price: number;
  totalCopies: number;
  availableCopies: number;
  pdfUrl: string;
}

export interface Reservation {
  id: number;
  userId: number;
  bookId: number;
  reservationDate: string;
  reservationStatus: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface Purchase {
  id: number;
  userId: number;
  bookId: number;
  price: number;
  purchaseDate: string;
  paymentStatus: 'PAID' | 'FAILED';
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private base = `${environment.libraryServiceUrl}/library`;

  constructor(private http: HttpClient) {}

  // ── Books ──────────────────────────────────────────────────────────────────
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.base}/books`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.base}/books/${id}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  // ── Reservations ───────────────────────────────────────────────────────────
  reserveBook(bookId: number, userId: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.base}/reservations/reserve/${bookId}/${userId}`, {})
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  cancelReservation(id: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.base}/reservations/cancel/${id}`, {})
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  getMyReservations(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.base}/reservations/user/${userId}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  // ── Purchases ──────────────────────────────────────────────────────────────
  getMyPurchases(userId: number): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.base}/marketplace/my-purchases/${userId}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  hasPurchased(userId: number, bookId: number): Observable<{ purchased: boolean }> {
    return this.http.get<{ purchased: boolean }>(`${this.base}/stripe/purchased/${userId}/${bookId}`)
      .pipe(timeout(10000), catchError(e => this.handleError(e)));
  }

  // ── Stripe ─────────────────────────────────────────────────────────────────
  getStripeConfig(): Observable<{ publishableKey: string }> {
    console.log('[LibraryService] Fetching Stripe config from:', `${this.base}/stripe/config`);
    return this.http.get<{ publishableKey: string }>(`${this.base}/stripe/config`)
      .pipe(
        timeout(10000),
        catchError(e => {
          console.error('[LibraryService] Stripe config error:', e);
          return this.handleError(e);
        })
      );
  }

  createPaymentIntent(bookId: number, userId: number): Observable<{ clientSecret: string; amount: number; currency: string }> {
    console.log('[LibraryService] Creating payment intent for book:', bookId, 'user:', userId);
    return this.http.post<any>(`${this.base}/stripe/create-payment-intent`, { bookId, userId })
      .pipe(
        timeout(15000),
        catchError(e => {
          console.error('[LibraryService] Payment intent error:', e);
          return this.handleError(e);
        })
      );
  }

  confirmPurchase(bookId: number, userId: number, paymentIntentId: string): Observable<Purchase> {
    console.log('[LibraryService] Confirming purchase:', { bookId, userId, paymentIntentId });
    return this.http.post<Purchase>(`${this.base}/stripe/confirm-purchase`, { bookId, userId, paymentIntentId })
      .pipe(
        timeout(15000),
        catchError(e => {
          console.error('[LibraryService] Confirm purchase error:', e);
          return this.handleError(e);
        })
      );
  }

  // ── File URL helper ────────────────────────────────────────────────────────
  getFileUrl(path: string): string {
    if (!path) return '';

    // Already a full URL
    if (path.startsWith('http')) return path;

    // Stored as uploads/filename → convert to /library/files/filename
    if (path.startsWith('uploads/')) {
      path = '/library/files/' + path.substring('uploads/'.length);
    }

    // Stored as just a filename (no leading slash)
    if (!path.startsWith('/')) {
      path = '/library/files/' + path;
    }

    // Relative path — prepend the service base URL
    return `${environment.libraryServiceUrl}${path}`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let msg = 'Library service error';
    if (error.status === 0) msg = 'Cannot reach library service — is it running on port 8078?';
    else if (error.status === 404) msg = 'Resource not found';
    else if (error.status === 500) msg = 'Server error';
    console.error('[LibraryService]', msg, error);
    return throwError(() => new Error(msg));
  }
}
