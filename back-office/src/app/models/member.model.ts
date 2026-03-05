export type NiveauAnglais = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface Member {
  idMember: number;
  idUser: number;
  idClub: number;

  nom: string;
  prenom: string;
  email: string;
  telephone: string;

  niveauAnglais?: NiveauAnglais;
  dateJoin?: string; // ou Date selon ton backend
}