import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OffreRecrutement, CandidatureEnseignant } from '../models/recrutement.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecrutementService {
  private http = inject(HttpClient);
  private apiUrl = environment.recrutementServiceUrl;

  // CRUD Offres
  getAllOffres(): Observable<OffreRecrutement[]> {
    return this.http.get<OffreRecrutement[]>(`${this.apiUrl}/offres`);
  }

  getOffreById(id: number): Observable<OffreRecrutement> {
    return this.http.get<OffreRecrutement>(`${this.apiUrl}/offres/${id}`);
  }

  getOffresByStatut(statut: string): Observable<OffreRecrutement[]> {
    return this.http.get<OffreRecrutement[]>(`${this.apiUrl}/offres/statut/${statut}`);
  }

  getOffresBySpecialite(specialite: string): Observable<OffreRecrutement[]> {
    return this.http.get<OffreRecrutement[]>(`${this.apiUrl}/offres/specialite/${specialite}`);
  }

  // Candidatures
  postuler(offreId: number, candidature: CandidatureEnseignant): Observable<CandidatureEnseignant> {
    return this.http.post<CandidatureEnseignant>(
      `${this.apiUrl}/candidatures?offreId=${offreId}`,
      candidature
    );
  }
}
