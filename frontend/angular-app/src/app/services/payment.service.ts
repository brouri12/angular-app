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

export interface PaymentRequest {
  idUser?: number;
  idAbonnement?: number;
  nomClient: string;
  emailClient: string;
  typeAbonnement: string;
  montant: number;
  methodePaiement: string;
  referenceTransaction: string;
  stripePaymentId?: string;
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

  createPayment(request: PaymentRequest): Observable<Payment> {
    const headers = this.getHeaders();
    return this.http.post<Payment>(this.apiUrl, request, { headers });
  }

  uploadReceipt(paymentId: number, file: File): Observable<Payment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = this.getAuthHeaders();
    return this.http.post<Payment>(
      `${this.apiUrl}/${paymentId}/upload-receipt`,
      formData,
      { headers }
    );
  }

  getPaymentsByUser(userId: number): Observable<Payment[]> {
    const headers = this.getHeaders();
    return this.http.get<Payment[]>(`${this.apiUrl}/user/${userId}`, { headers });
  }

  getReceiptUrl(fileName: string): string {
    return `${this.apiUrl}/receipt/${fileName}`;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
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
