import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Abonnement, HistoriqueAbonnement } from '../models/abonnement.model';

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8888/abonnement-service/api/abonnements';

  // Abonnements
  getAllAbonnements(): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(this.apiUrl);
  }

  getAbonnementById(id: number): Observable<Abonnement> {
    return this.http.get<Abonnement>(`${this.apiUrl}/${id}`);
  }

  searchByNom(nom: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/byNom?nom=${nom}&page=${page}&size=${size}`);
  }

  searchByStatut(statut: string): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(`${this.apiUrl}/search/byStatut?statut=${statut}`);
  }

  searchByPrixMax(prix: number): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(`${this.apiUrl}/search/byPrixMax?prix=${prix}`);
  }

  addAbonnement(abonnement: Abonnement): Observable<Abonnement> {
    return this.http.post<Abonnement>(this.apiUrl, abonnement);
  }

  updateAbonnement(id: number, abonnement: Abonnement): Observable<Abonnement> {
    return this.http.put<Abonnement>(`${this.apiUrl}/${id}`, abonnement);
  }

  updateStatut(id: number, statut: string): Observable<Abonnement> {
    return this.http.patch<Abonnement>(`${this.apiUrl}/${id}/statut?statut=${statut}`, {});
  }

  deleteAbonnement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Paiements
  getAllPaiements(): Observable<HistoriqueAbonnement[]> {
    return this.http.get<HistoriqueAbonnement[]>(`${this.apiUrl}/paiements`);
  }

  getPaiementById(id: number): Observable<HistoriqueAbonnement> {
    return this.http.get<HistoriqueAbonnement>(`${this.apiUrl}/paiements/${id}`);
  }

  addPaiement(paiement: HistoriqueAbonnement): Observable<HistoriqueAbonnement> {
    return this.http.post<HistoriqueAbonnement>(`${this.apiUrl}/paiements`, paiement);
  }

  getPaiementsByClient(email: string): Observable<HistoriqueAbonnement[]> {
    return this.http.get<HistoriqueAbonnement[]>(`${this.apiUrl}/paiements/client/${email}`);
  }

  getPaiementsByStatut(statut: string): Observable<HistoriqueAbonnement[]> {
    return this.http.get<HistoriqueAbonnement[]>(`${this.apiUrl}/paiements/search/byStatut?statut=${statut}`);
  }

  updateStatutPaiement(id: number, statut: string): Observable<HistoriqueAbonnement> {
    return this.http.patch<HistoriqueAbonnement>(`${this.apiUrl}/paiements/${id}/statut?statut=${statut}`, {});
  }

  deletePaiement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/paiements/${id}`);
  }
}
