import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, Planification, Salle } from '../models/planification.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PlanificationService {
  private baseUrl = 'http://localhost:8888/planification-service/api';

  constructor(private http: HttpClient) {}

  // ── Groups ─────────────────────────────────────────────────────────────────

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.baseUrl}/groups`);
  }

  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/groups/${id}`);
  }

  // ── Planifications ─────────────────────────────────────────────────────────

  getPlanifications(): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.baseUrl}/planifications`);
  }

  getPlanificationsByGroup(groupId: number): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.baseUrl}/planifications`);
  }

  // ── Salles ─────────────────────────────────────────────────────────────────

  getSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.baseUrl}/salles`);
  }

  // ── Calendar / PDF export ──────────────────────────────────────────────────

  getStudentCalendarPdfUrl(studentId: number): string {
    return `${this.baseUrl}/calendar/student/${studentId}/pdf`;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getStudentGroup(studentUserId: number, groups: Group[]): Group | null {
    return groups.find(g => g.studentIds?.includes(studentUserId)) || null;
  }

  getGroupMembers(studentIds: number[], allUsers: User[]): User[] {
    return allUsers.filter(u => u.id_user && studentIds.includes(u.id_user));
  }
}
