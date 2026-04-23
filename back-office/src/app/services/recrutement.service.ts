import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OffreRecrutement, CandidatureEnseignant } from '../models/recrutement.model';

@Injectable({
  providedIn: 'root'
})
export class RecrutementService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8888/api/recrutement';

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

  rouvrirOffre(id: number): Observable<OffreRecrutement> {
    return this.http.patch<OffreRecrutement>(`${this.apiUrl}/offres/${id}/rouvrir`, {});
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
      `${this.apiUrl}/candidatures/offre/${offreId}`,
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

  downloadCV(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/candidatures/${id}/cv`, { responseType: 'blob' });
  }

  getOffreCompatible(candidatureId: number): Observable<{ offreCompatible: OffreRecrutement | null, message: string }> {
    return this.http.get<{ offreCompatible: OffreRecrutement | null, message: string }>(
      `${this.apiUrl}/candidatures/${candidatureId}/offre-compatible`
    );
  }

  getClassement(offreId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/offres/${offreId}/classement`);
  }

  getScoringDetail(candidatureId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/candidatures/${candidatureId}/scoring`);
  }

  analyserLettre(lettre: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/analyse-lettre`, { lettre });
  }
}
