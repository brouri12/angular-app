import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, switchMap, timeout, catchError, throwError } from 'rxjs';
import { User, RegisterRequest, LoginRequest, TokenResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Call through API Gateway
  private apiUrl = 'http://localhost:8888/user-service/api/auth';
  private keycloakUrl = 'http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      this.isAuthenticatedSubject.next(true);
      this.loadCurrentUser();
    }
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.get<User>(`${this.apiUrl}/user-by-email?email=${request.email}`).pipe(
      timeout(10000), // 10 second timeout
      catchError(error => {
        console.error('Error fetching user by email:', error);
        return throwError(() => error);
      }),
      switchMap(user => {
        const body = new URLSearchParams();
        body.set('username', user.username);
        body.set('password', request.password);
        body.set('grant_type', 'password');
        body.set('client_id', 'wordly-client');
        body.set('client_secret', 'wBCcaBhZbarCcZovTzSniLtjCrYoidvl');

        const headers = new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post<TokenResponse>(this.keycloakUrl, body.toString(), { headers }).pipe(
          timeout(10000), // 10 second timeout
          catchError(error => {
            console.error('Error logging in to Keycloak:', error);
            return throwError(() => error);
          })
        );
      }),
      tap(response => {
        this.saveToken(response.access_token);
        this.saveRefreshToken(response.refresh_token);
        this.isAuthenticatedSubject.next(true);
        // Don't call loadCurrentUser here - let the component handle it
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/me`, { headers }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  // Load current user (public method)
  loadUser(): void {
    this.loadCurrentUser();
  }

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

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

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

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

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
      })
    );
  }
}
