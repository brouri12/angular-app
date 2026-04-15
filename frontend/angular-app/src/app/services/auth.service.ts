import { Injectable, computed } from '@angular/core';
import type { KeycloakProfile } from 'keycloak-js';
declare const keycloak: any;  // Global keycloak (initialisé dans main.ts)

export type UserRole = 'student' | 'tuteur';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal des rôles utilisateur (realm_access.roles)
  userRoles = computed<string[]>(() => {
    return (keycloak as any).tokenParsed?.realm_access?.roles ?? [];
  });

  // Vérifie si user a rôle spécifique (retourne signal)
  hasRole = (role: UserRole) => {
    return computed(() => this.userRoles().includes(role));
  };

  // Rôle principal (premier rôle)
  primaryRole = computed<UserRole | null>(() => {
    const roles = this.userRoles();
    return (roles.find(r => ['student', 'tuteur'].includes(r)) as UserRole) ?? null;
  });

  // Username
  username = computed(() => {
    const k = (window as any).keycloak || (typeof keycloak !== 'undefined' ? keycloak : null);
    return k?.tokenParsed?.['preferred_username'] ?? '';
  });

  // Logged in
  isLoggedIn = computed(() => {
    const k = (window as any).keycloak || (typeof keycloak !== 'undefined' ? keycloak : null);
    return k?.authenticated ?? !!k?.token;
  });

  // Profile
  profile = computed<KeycloakProfile | null>(() => (keycloak as any).profile ?? null);
}

