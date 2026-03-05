export interface OffreRecrutement {
  id?: number;
  titre: string;
  description: string;
  specialite: string;
  niveau_requis: string;
  type_contrat: string;
  date_publication?: Date;
  date_limite: Date;
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
  cv_pdf?: string; // Base64 encoded PDF
  cv_filename?: string;
  cv_content_type?: string;
  lettre_motivation: string;
  date_candidature?: Date | string;
  statut: string;
}
