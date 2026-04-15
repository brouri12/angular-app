import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Planification, Salle, Group } from '../models/planification.model';

@Injectable({ providedIn: 'root' })
export class PlanificationService {
    private readonly baseUrl = `http://localhost:8888/planification-service/api`;

    constructor(private http: HttpClient) { }

    // --- Salles ---
    getSalles(): Observable<Salle[]> {
        return this.http.get<Salle[]>(`${this.baseUrl}/salles`);
    }
    getSalleById(id: number): Observable<Salle> {
        return this.http.get<Salle>(`${this.baseUrl}/salles/${id}`);
    }
    createSalle(salle: Salle): Observable<Salle> {
        return this.http.post<Salle>(`${this.baseUrl}/salles`, salle);
    }
    updateSalle(id: number, salle: Salle): Observable<Salle> {
        return this.http.put<Salle>(`${this.baseUrl}/salles/${id}`, salle);
    }
    deleteSalle(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/salles/${id}`);
    }

    // --- Groups ---
    getGroups(): Observable<Group[]> {
        return this.http.get<Group[]>(`${this.baseUrl}/groups`);
    }
    createGroup(group: Group): Observable<Group> {
        return this.http.post<Group>(`${this.baseUrl}/groups`, group);
    }
    assignTeacherToGroup(groupId: number, teacherId: number): Observable<Group> {
        return this.http.post<Group>(`${this.baseUrl}/groups/${groupId}/teacher/${teacherId}`, {});
    }
    addStudentToGroup(groupId: number, studentId: number): Observable<Group> {
        return this.http.post<Group>(`${this.baseUrl}/groups/${groupId}/student/${studentId}`, {});
    }
    assignStudentsToGroup(groupId: number, studentIds: number[]): Observable<Group> {
        return this.http.post<Group>(`${this.baseUrl}/groups/${groupId}/students`, studentIds);
    }
    updateGroup(id: number, group: Group): Observable<Group> {
        return this.http.put<Group>(`${this.baseUrl}/groups/${id}`, group);
    }
    deleteGroup(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/groups/${id}`);
    }

    // --- Planifications ---
    getPlanifications(): Observable<Planification[]> {
        return this.http.get<Planification[]>(`${this.baseUrl}/planifications`);
    }
    createPlanification(planification: Planification): Observable<Planification> {
        return this.http.post<Planification>(`${this.baseUrl}/planifications`, planification);
    }
    updatePlanification(id: number, planification: Planification): Observable<Planification> {
        return this.http.put<Planification>(`${this.baseUrl}/planifications/${id}`, planification);
    }
    deletePlanification(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/planifications/${id}`);
    }

    // --- Analytics ---
    getRoomAnalytics(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/analytics/rooms`);
    }
}
