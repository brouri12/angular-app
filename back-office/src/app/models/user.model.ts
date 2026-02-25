export interface User {
  id_user?: number;
  username: string;
  email: string;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
  enabled?: boolean;
  date_creation?: string;
  last_login?: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  keycloak_id?: string;
  // Teacher fields
  specialite?: string;
  experience?: number;
  disponibilite?: string;
  // Student fields
  date_naissance?: string;
  niveau_actuel?: string;
  statut_etudiant?: string;
  // Admin fields
  poste?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
  nom: string;
  prenom: string;
  telephone: string;
  // Teacher fields
  specialite?: string;
  experience?: number;
  disponibilite?: string;
  // Student fields
  date_naissance?: string;
  niveau_actuel?: string;
  statut_etudiant?: string;
  // Admin fields
  poste?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
}
