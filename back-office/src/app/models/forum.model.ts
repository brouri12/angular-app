export interface Forum {
  id?: number;
  titre: string;
  description: string;
  date_creation?: string | Date;
  cree_par: number;
  niveau: string;
  groupe: string;
  cours: string;
  statut: string;
}

export interface MessageForum {
  id?: number;
  contenu: string;
  date_message?: string | Date;
  auteurId: number;
  type_auteur: string;
  statut: string;
  forum?: Forum;
}

export interface LikeMessage {
  id?: number;
  messageId: number;
  utilisateurId: number;
  dateLike?: string | Date;
}

export interface ReponseMessage {
  id?: number;
  messageParentId: number;
  auteurId: number;
  contenu: string;
  dateReponse?: string | Date;
  statut?: string;
}

export interface Signalement {
  id?: number;
  messageId: number;
  signalePar: number;
  motif: string;
  description?: string;
  dateSignalement?: string | Date;
  statut?: string;
  traitePar?: number;
  dateTraitement?: string | Date;
  commentaireModerateur?: string;
}

export interface NotificationForum {
  id?: number;
  destinataireId: number;
  type: string;
  message: string;
  messageId?: number;
  forumId?: number;
  dateCreation?: string | Date;
  lu?: boolean;
  dateLecture?: string | Date;
}

export interface BadgeUtilisateur {
  id?: number;
  utilisateurId: number;
  points: number;
  niveauBadge: string;
  nombreMessages: number;
  nombreLikesRecus: number;
  nombreReponses: number;
  derniereMiseAJour?: string | Date;
}

export interface StatistiquesGlobales {
  nombreForums: number;
  nombreMessages: number;
  nombreLikes: number;
  nombreReponses: number;
  nombreUtilisateurs: number;
  topContributeurs: BadgeUtilisateur[];
}
