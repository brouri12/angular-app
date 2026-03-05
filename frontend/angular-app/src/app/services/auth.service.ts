import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { BehaviorSubject } from 'rxjs';

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:8180/realms/gestions-ramzi',
  redirectUri: window.location.origin + '/index.html',
  clientId: 'frontend-app',
  scope: 'openid profile email',
  responseType: 'code',
  showDebugInformation: true,
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(private oauthService: OAuthService) {
    this.configure();
  }

  private configure() {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
    
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        this.loadUserProfile();
      }
    });
  }

  private loadUserProfile() {
    this.oauthService.loadUserProfile().then(profile => {
      this.userProfileSubject.next(profile);
    });
  }

  get token(): string {
    return this.oauthService.getAccessToken();
  }

  get isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  get roles(): string[] {
    const claims = this.oauthService.getIdentityClaims() as any;
    return claims?.realm_access?.roles || [];
  }

  get userId(): string {
    const claims = this.oauthService.getIdentityClaims() as any;
    return claims?.sub;
  }

  get username(): string {
    const claims = this.oauthService.getIdentityClaims() as any;
    return claims?.preferred_username || claims?.name;
  }

  get email(): string {
    const claims = this.oauthService.getIdentityClaims() as any;
    return claims?.email;
  }

  login() {
    this.oauthService.initLoginFlow();
  }

  logout() {
    this.oauthService.logOut();
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  get isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  get isEnseignant(): boolean {
    return this.hasRole('ENSEIGNANT');
  }

  get isEtudiant(): boolean {
    return this.hasRole('ETUDIANT');
  }
}

