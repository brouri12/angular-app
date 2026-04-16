import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, RegisterRequest } from '../models/user.model';

/**
 * Simplified Auth Service for Game-Only Mode
 * No backend authentication - uses local storage for demo purposes
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Simple login - stores user in localStorage
   */
  login(username: string, password: string) {
    // For demo purposes, accept any credentials
    const user: User = {
      id_user: 1,
      username: username,
      email: `${username}@example.com`,
      role: 'STUDENT',
      enabled: true
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    
    return Promise.resolve(user);
  }

  /**
   * Simple register - stores user in localStorage
   */
  register(request: RegisterRequest): Observable<{ message: string; user: User }> {
    const user: User = {
      id_user: 1,
      username: request.username,
      email: request.email,
      role: request.role,
      enabled: true,
      nom: request.nom,
      prenom: request.prenom,
      telephone: request.telephone,
      date_naissance: request.date_naissance,
      niveau_actuel: request.niveau_actuel,
      statut_etudiant: request.statut_etudiant,
      specialite: request.specialite,
      experience: request.experience,
      disponibilite: request.disponibilite,
      poste: request.poste
    };
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    
    return of({ message: 'Registration successful', user });
  }

  /**
   * Logout - removes user from localStorage
   */
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get token (returns dummy token for compatibility)
   */
  getToken(): string | null {
    return this.isAuthenticatedSubject.value ? 'demo-token' : null;
  }

  /**
   * Check if authenticated
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if authenticated (alias)
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Update user profile
   */
  updateProfile(userId: number, updateData: Partial<User>): Observable<User> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const updatedUser: User = {
      ...currentUser,
      ...updateData
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);

    return of(updatedUser);
  }
}
