import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Member, MemberRole, MemberStatus } from '../models/member.model';

@Injectable({ providedIn: 'root' })
export class MemberAdminService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://localhost:8888/membres';

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateRole(id: number, role: MemberRole): Observable<Member> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.put<Member>(`${this.apiUrl}/${id}/role`, { role }, { headers });
  }

  updateStatus(id: number, status: MemberStatus): Observable<Member> {
    const headers = this.getHeaders().set('Content-Type', 'application/json');
    return this.http.put<Member>(`${this.apiUrl}/${id}/status`, { status }, { headers });
  }
}
