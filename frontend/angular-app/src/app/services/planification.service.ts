import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, Student, Teacher, Planification } from '../models/planification.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PlanificationService {
  private baseUrl = 'http://localhost:8888/planification-service/api';

  constructor(private http: HttpClient) { }

  // Groups
  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.baseUrl}/groups`);
  }

  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/groups/${id}`);
  }

  // Students
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students`);
  }

  // Teachers
  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/teachers`);
  }

  // Planifications
  getPlanifications(): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.baseUrl}/planifications`);
  }

  getPlanificationsByGroup(groupId: number): Observable<Planification[]> {
    return this.http.get<Planification[]>(`${this.baseUrl}/planifications`);
  }

  // Helper method to get student's group
  getStudentGroup(studentUserId: number, groups: Group[]): Group | null {
    return groups.find(g => g.studentIds?.includes(studentUserId)) || null;
  }

  // Helper method to get group members (from UserService)
  getGroupMembers(studentIds: number[], allUsers: User[]): User[] {
    return allUsers.filter(u => u.id_user && studentIds.includes(u.id_user));
  }
}
