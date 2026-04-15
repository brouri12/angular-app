import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { keycloak } from '../main';

@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip Keycloak internal URLs
    if (req.url.includes('/realms/') || req.url.includes('keycloak')) {
      return next.handle(req);
    }

    // Wrap the token logic in an observable
    return from(this.getToken()).pipe(
      switchMap(token => {
        if (token) {
          console.log('Attaching token to request:', token);
          const clonedReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(clonedReq);
        } else {
          console.warn('No token available, sending request without Authorization header');
          return next.handle(req);
        }
      })
    );
  }

  private async getToken(): Promise<string | null> {
    try {
      if (!keycloak.token) {
        console.warn('Keycloak token not initialized yet.');
        return null;
      }

      // Refresh token if expired or close to expiry
      const expired = keycloak.isTokenExpired(30);
      if (expired) {
        console.log('Token expired or about to expire, refreshing...');
        const refreshed = await keycloak.updateToken(60);
        if (!refreshed) {
          console.warn('Token not refreshed, using existing token');
        }
      }

      console.log('Returning Keycloak token:', keycloak.token);
      return keycloak.token || null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return keycloak.token || null;
    }
  }
}