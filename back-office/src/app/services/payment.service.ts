import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Payment {
  id_payment?: number;
  idUser?: number;
  idAbonnement?: number;
  nomClient: string;
  emailClient: string;
  typeAbonnement: string;
  montant: number;
  methodePaiement: string;
  statut?: string;
  referenceTransaction: string;
  stripePaymentId?: string;
  receiptUrl?: string;
  datePaiement?: string;
  dateValidation?: string;
  validatedBy?: number;
  notes?: string;
}

export interface ValidationRequest {
  adminId: number;
  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8888/user-service/api/payments';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllPayments(): Observable<Payment[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Payment[]>(this.apiUrl, { headers });
  }

  getPendingPayments(): Observable<Payment[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Payment[]>(`${this.apiUrl}/pending`, { headers });
  }

  getPaymentById(id: number): Observable<Payment> {
    const headers = this.getAuthHeaders();
    return this.http.get<Payment>(`${this.apiUrl}/${id}`, { headers });
  }

  validatePayment(paymentId: number, adminId: number, notes: string): Observable<Payment> {
    const headers = this.getAuthHeaders();
    const request: ValidationRequest = { adminId, notes };
    return this.http.put<Payment>(
      `${this.apiUrl}/${paymentId}/validate`,
      request,
      { headers }
    );
  }

  rejectPayment(paymentId: number, adminId: number, notes: string): Observable<Payment> {
    const headers = this.getAuthHeaders();
    const request: ValidationRequest = { adminId, notes };
    return this.http.put<Payment>(
      `${this.apiUrl}/${paymentId}/reject`,
      request,
      { headers }
    );
  }

  getReceiptUrl(fileName: string): string {
    return `${this.apiUrl}/receipt/${fileName}`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }
}
