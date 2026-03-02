import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResolutionAction {
  id?: number;
  reclamationId?: number;
  action?: string;
  responsable?: string;
  dateAction?: string | Date;
}

@Injectable({
  providedIn: 'root'
})
export class ResolutionActionService {
  private apiUrl = 'http://localhost:8082/api/resolutions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ResolutionAction[]> {
    return this.http.get<ResolutionAction[]>(this.apiUrl);
  }

  getById(id: number): Observable<ResolutionAction> {
    return this.http.get<ResolutionAction>(`${this.apiUrl}/${id}`);
  }

  getByReclamation(reclamationId: number): Observable<ResolutionAction[]> {
    return this.http.get<ResolutionAction[]>(`${this.apiUrl}/reclamation/${reclamationId}`);
  }

  create(action: ResolutionAction): Observable<ResolutionAction> {
    return this.http.post<ResolutionAction>(this.apiUrl, action);
  }

  update(id: number, action: ResolutionAction): Observable<ResolutionAction> {
    return this.http.put<ResolutionAction>(`${this.apiUrl}/${id}`, action);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
