import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

export interface User {
  id_user: number;
  username: string;
  email: string;
  nom?: string;
  prenom?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  enabled: boolean;
  date_creation: string;
  date_modification?: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  statut?: string;
  specialite?: string;
  niveau?: string;
}

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalTeachers: number;
  totalStudents: number;
  activeUsers: number;
  inactiveUsers: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Mode "Node API" (sans microservices) pour éviter les erreurs 400/401.
  // Le serveur Node expose déjà: /api/students et /api/teachers.
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    const students$ = this.http.get<any[]>('/api/students');
    const teachers$ = this.http.get<any[]>('/api/teachers');

    return students$.pipe(
      map((students) => ({ students: students || [] })),
      // simple chain without forkJoin to keep dependencies minimal
      // (teachers fetched after students)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (source: any) =>
        new Observable<User[]>((subscriber) => {
          const sub = source.subscribe({
            next: ({ students }: { students: any[] }) => {
              this.http.get<any[]>('/api/teachers').subscribe({
                next: (teachers) => {
                  const rows = [
                    ...(students || []).map((s) => this.mapNodePersonToUser(s, 'STUDENT')),
                    ...(teachers || []).map((t) => this.mapNodePersonToUser(t, 'TEACHER')),
                  ];
                  subscriber.next(rows);
                  subscriber.complete();
                },
                error: (e) => subscriber.error(e),
              });
            },
            error: (e: unknown) => subscriber.error(e),
          });
          return () => sub.unsubscribe();
        })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<any>(`/api/students/${id}`).pipe(
      map((row) => this.mapNodePersonToUser(row, 'STUDENT'))
    );
  }

  getUsersByRole(role: string): Observable<User[]> {
    // Le Node API expose 2 listes. On filtre côté front.
    return this.getAllUsers().pipe(map((rows) => rows.filter((u) => u.role === role)));
  }

  getUsersByEnabled(enabled: boolean): Observable<User[]> {
    return this.getAllUsers().pipe(map((rows) => rows.filter((u) => u.enabled === enabled)));
  }

  searchUsers(query: string): Observable<User[]> {
    const q = (query || '').toLowerCase();
    return this.getAllUsers().pipe(
      map((rows) =>
        rows.filter((u) =>
          [u.username, u.email, u.nom, u.prenom].filter(Boolean).some((x) => String(x).toLowerCase().includes(q))
        )
      )
    );
  }

  toggleUserStatus(id: number): Observable<User> {
    return new Observable<User>((subscriber) => {
      subscriber.error(new Error('toggleUserStatus non supporté via Node API'));
    });
  }

  deleteUser(id: number): Observable<void> {
    return new Observable<void>((subscriber) => {
      subscriber.error(new Error('deleteUser non supporté via Node API'));
    });
  }

  getStats(): Observable<UserStats> {
    return this.getAllUsers().pipe(
      map((rows) => {
        const totalUsers = rows.length;
        const totalAdmins = rows.filter((u) => u.role === 'ADMIN').length;
        const totalTeachers = rows.filter((u) => u.role === 'TEACHER').length;
        const totalStudents = rows.filter((u) => u.role === 'STUDENT').length;
        const activeUsers = rows.filter((u) => u.enabled).length;
        const inactiveUsers = totalUsers - activeUsers;
        return { totalUsers, totalAdmins, totalTeachers, totalStudents, activeUsers, inactiveUsers };
      })
    );
  }

  private mapNodePersonToUser(row: any, role: 'STUDENT' | 'TEACHER'): User {
    const id = Number(row?.id ?? row?.id_user ?? 0);
    const firstName = row?.firstName ?? row?.prenom ?? row?.first_name ?? '';
    const lastName = row?.lastName ?? row?.nom ?? row?.last_name ?? '';
    const email = row?.email ?? '';
    const username = row?.username ?? email ?? `${role.toLowerCase()}-${id}`;
    const created = row?.registrationDate ?? row?.createdAt ?? row?.date_creation ?? new Date().toISOString();

    return {
      id_user: id,
      username,
      email,
      prenom: firstName || undefined,
      nom: lastName || undefined,
      role,
      enabled: true,
      date_creation: String(created),
    };
  }
}
