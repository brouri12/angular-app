import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap, timeout, catchError, throwError, finalize, of } from 'rxjs';
import { RegisterRequest, LoginRequest, TokenResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // UserService direct (8085) pour tout l'auth - evite erreur 0 avec la gateway (8888)
  private apiUrl = 'http://localhost:8085/api/auth';
  private keycloakUrl = 'http://localhost:8085/api/auth/token';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      this.isAuthenticatedSubject.next(true);
      this.loadCurrentUser();
    }
  }

  // Register new user
  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user-by-email?email=${encodeURIComponent(email)}`);
  }

  /** Cree les 3 comptes de test (Teacher, Student, Admin) s'ils n'existent pas. */
  ensureTestUsers(): Observable<{ message: string; created: unknown[]; skipped: unknown[]; errors: string[] }> {
    return this.http.get<{ message: string; created: unknown[]; skipped: unknown[]; errors: string[] }>(
      `${this.apiUrl}/ensure-test-users`
    );
  }

  // Login with Keycloak (using email)
  login(request: LoginRequest): Observable<TokenResponse> {
    const email = (request.email || '').trim();
    const localPart = email.split('@')[0] || '';

    return this.http.get<User>(`${this.apiUrl}/user-by-email?email=${encodeURIComponent(email)}`).pipe(
      timeout(10000),
      catchError(err => {
        if (err?.status === 404) {
          // Plus d'utilisateur en base ni dans Keycloak pour cet email, ou UserService indisponible côté sync
          return of(null as User | null);
        }
        console.error('Error fetching user by email:', err);
        return throwError(() => err);
      }),
      switchMap(user => {
        const candidates = (user
          ? [user.username, localPart, email]
          : [localPart, email]
        )
          .map(v => (v || '').trim())
          .filter((v, i, arr) => !!v && arr.indexOf(v) === i);
        return this.tryLoginCandidates(candidates, request.password);
      }),
      tap(response => {
        this.saveToken(response.access_token);
        this.saveRefreshToken(response.refresh_token);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  private requestKeycloakToken(username: string, password: string): Observable<TokenResponse> {
    const body = { username, password };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<TokenResponse>(this.keycloakUrl, body, { headers }).pipe(
      timeout(10000)
    );
  }

  private tryLoginCandidates(candidates: string[], password: string, index = 0): Observable<TokenResponse> {
    if (index >= candidates.length) {
      return throwError(() => new Error('Invalid email or password'));
    }
    const username = candidates[index];
    return this.requestKeycloakToken(username, password).pipe(
      catchError(err => {
        const status = err?.status;
        if (status === 400 || status === 401 || status === 404 || status === 0) {
          return this.tryLoginCandidates(candidates, password, index + 1);
        }
        return throwError(() => err);
      })
    );
  }

  // Get current user info
  getCurrentUser(): Observable<User> {
    const token = this.getToken();
    console.log('getCurrentUser - Token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...');
    }
    const headers = this.getAuthHeaders();
    console.log('Headers:', headers);
    console.log('Making request to:', `${this.apiUrl}/me`);
    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
      tap(user => {
        console.log('✓ User received from API:', user);
        console.log('✓ User fields:', {
          username: user.username,
          email: user.email,
          role: user.role,
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone,
          date_naissance: user.date_naissance,
          niveau_actuel: user.niveau_actuel,
          statut_etudiant: user.statut_etudiant
        });
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('✗ getCurrentUser error:', error);
        console.error('✗ Error status:', error.status);
        console.error('✗ Error message:', error.message);
        return throwError(() => error);
      })
    );
  }

  // Load current user (public method)
  loadUser(): void {
    this.loadCurrentUser();
  }

  // Load current user
  private loadCurrentUser(): void {
    this.getCurrentUser().subscribe({
      next: (user) => {
        console.log('User loaded from API:', user);
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        console.error('Could not load user from API:', err);
        // Don't use token fallback - just set null
        this.currentUserSubject.next(null);
      }
    });
  }

  // Decode JWT token
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token:', e);
      return {};
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  // Token management
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Get auth headers
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Get current user value
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Update user profile
  updateProfile(userId: number, userData: Partial<User>): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<User>(`${this.apiUrl.replace('/auth', '')}/users/${userId}`, userData, { headers }).pipe(
      tap(updatedUser => {
        console.log('Profile updated:', updatedUser);
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        console.log('Update request completed (success or error)');
      })
    );
  }
}
