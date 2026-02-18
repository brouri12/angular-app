export interface Forum {
  id?: number;
  titre: string;
  description: string;
  date_creation?: Date;
  cree_par: number;
  niveau: string;
  groupe: string;
  cours: string;
  statut: string;
}

export interface MessageForum {
  id?: number;
  contenu: string;
  date_message?: Date;
  auteurId: number;
  type_auteur: string;
  statut: string;
  forum?: Forum;
}
