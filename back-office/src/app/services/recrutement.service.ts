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

  createOffre(offre: OffreRecrutement): Observable<OffreRecrutement> {
    return this.http.post<OffreRecrutement>(`${this.apiUrl}/offres`, offre);
  }

  updateOffre(id: number, offre: OffreRecrutement): Observable<OffreRecrutement> {
    return this.http.put<OffreRecrutement>(`${this.apiUrl}/offres/${id}`, offre);
  }

  deleteOffre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/offres/${id}`);
  }

  fermerOffre(id: number): Observable<OffreRecrutement> {
    return this.http.patch<OffreRecrutement>(`${this.apiUrl}/offres/${id}/fermer`, {});
  }

  getOffresByStatut(statut: string): Observable<OffreRecrutement[]> {
    return this.http.get<OffreRecrutement[]>(`${this.apiUrl}/offres/statut/${statut}`);
  }

  getOffresBySpecialite(specialite: string): Observable<OffreRecrutement[]> {
    return this.http.get<OffreRecrutement[]>(`${this.apiUrl}/offres/specialite/${specialite}`);
  }

  // Candidatures
  getAllCandidatures(): Observable<CandidatureEnseignant[]> {
    return this.http.get<CandidatureEnseignant[]>(`${this.apiUrl}/candidatures`);
  }

  postuler(offreId: number, candidature: CandidatureEnseignant): Observable<CandidatureEnseignant> {
    return this.http.post<CandidatureEnseignant>(
      `${this.apiUrl}/candidatures?offreId=${offreId}`,
      candidature
    );
  }

  changerStatut(id: number, statut: string): Observable<CandidatureEnseignant> {
    return this.http.patch<CandidatureEnseignant>(
      `${this.apiUrl}/candidatures/${id}/statut?statut=${statut}`,
      {}
    );
  }

  getCandidaturesByOffre(offreId: number): Observable<CandidatureEnseignant[]> {
    return this.http.get<CandidatureEnseignant[]>(`${this.apiUrl}/candidatures/offre/${offreId}`);
  }

  getCandidaturesByStatut(statut: string): Observable<CandidatureEnseignant[]> {
    return this.http.get<CandidatureEnseignant[]>(`${this.apiUrl}/candidatures/statut/${statut}`);
  }

  filtrerParSpecialite(specialite: string): Observable<CandidatureEnseignant[]> {
    return this.http.get<CandidatureEnseignant[]>(
      `${this.apiUrl}/candidatures/specialite/${specialite}`
    );
  }

  convertirEnEnseignant(id: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/candidatures/${id}/convertir`, {});
  }
}
