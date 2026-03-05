export interface OffreRecrutement {
  id?: number;
  titre: string;
  description: string;
  specialite: string;
  niveau_requis: string;
  type_contrat: string;
  experience_min?: number;
  date_publication?: string | Date;
  date_limite: string | Date;
  statut: string;
  salaire_min?: number;
  salaire_max?: number;
  nombre_postes: number;
}

export interface CandidatureEnseignant {
  id_candidature?: number;
  nom_candidat: string;
  prenom_candidat: string;
  email: string;
  cv_pdf?: string; // Base64 encoded PDF for sending to backend
  cv_filename?: string;
  cv_content_type?: string;
  lettre_motivation: string;
  date_candidature?: string | Date;
  statut: string;
}
