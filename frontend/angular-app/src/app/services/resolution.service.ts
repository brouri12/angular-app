import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResolutionAction {
  id?: number;
  reclamationId: number;
  action?: string;
  responsable?: string;
  dateAction?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResolutionService {
  private apiUrl = 'http://localhost:8082/api/resolutions';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<ResolutionAction[]> {
    return this.http.get<ResolutionAction[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<ResolutionAction> {
    return this.http.get<ResolutionAction>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getByReclamationId(reclamationId: number): Observable<ResolutionAction[]> {
    return this.http.get<ResolutionAction[]>(`${this.apiUrl}/reclamation/${reclamationId}`, { headers: this.getHeaders() });
  }

  create(action: ResolutionAction): Observable<ResolutionAction> {
    return this.http.post<ResolutionAction>(this.apiUrl, action, { headers: this.getHeaders() });
  }

  update(id: number, action: ResolutionAction): Observable<ResolutionAction> {
    return this.http.put<ResolutionAction>(`${this.apiUrl}/${id}`, action, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}

// Export as both names for compatibility
export { ResolutionService as ResolutionActionService };

