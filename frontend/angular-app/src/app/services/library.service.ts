import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

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
  private readonly LIBRARY_URL = 'http://localhost:8078/library';

  constructor(private http: HttpClient) {}

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.LIBRARY_URL}/books`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.LIBRARY_URL}/books/${id}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  reserveBook(bookId: number, userId: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.LIBRARY_URL}/reservations/reserve/${bookId}/${userId}`, {})
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  cancelReservation(id: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.LIBRARY_URL}/reservations/cancel/${id}`, {})
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  getMyReservations(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.LIBRARY_URL}/reservations/user/${userId}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  getMyPurchases(userId: number): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.LIBRARY_URL}/marketplace/my-purchases/${userId}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  hasPurchased(userId: number, bookId: number): Observable<{ purchased: boolean }> {
    return this.http.get<{ purchased: boolean }>(`${this.LIBRARY_URL}/stripe/purchased/${userId}/${bookId}`)
      .pipe(timeout(10000), catchError(e => this.handleError(e)));
  }

  getStripeConfig(): Observable<{ publishableKey: string }> {
    return this.http.get<{ publishableKey: string }>(`${this.LIBRARY_URL}/stripe/config`)
      .pipe(timeout(10000), catchError(e => this.handleError(e)));
  }

  createPaymentIntent(bookId: number, userId: number): Observable<{ clientSecret: string; amount: number; currency: string }> {
    return this.http.post<any>(`${this.LIBRARY_URL}/stripe/create-payment-intent`, { bookId, userId })
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  confirmPurchase(bookId: number, userId: number, paymentIntentId: string): Observable<Purchase> {
    return this.http.post<Purchase>(`${this.LIBRARY_URL}/stripe/confirm-purchase`, { bookId, userId, paymentIntentId })
      .pipe(timeout(15000), catchError(e => this.handleError(e)));
  }

  getFileUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('uploads/')) path = '/library/files/' + path.substring('uploads/'.length);
    if (!path.startsWith('/')) path = '/library/files/' + path;
    return 'http://localhost:8078' + path;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let msg = 'Library service error';
    if (error.status === 0) msg = 'Cannot reach library service (port 8078)';
    else if (error.status === 404) msg = 'Resource not found';
    else if (error.status === 500) msg = 'Server error';
    return throwError(() => new Error(msg));
  }
}
