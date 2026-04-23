export interface Abonnement {
  id_abonnement?: number;
  nom: string;
  description: string;
  prix: number;
  duree_jours: number;
  niveau_acces: string;
  acces_illimite: boolean;
  support_prioritaire: boolean;
  statut: string;
  date_creation?: string;
}

export interface HistoriqueAbonnement {
  id_paiement?: number;
  nom_client: string;
  email_client: string;
  type_abonnement: string;
  montant: number;
  methode_paiement: string;
  reference_transaction: string;
  date_paiement?: string;
  statut: string;
}
