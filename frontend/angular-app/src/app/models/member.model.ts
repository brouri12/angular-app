export type NiveauAnglais = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type MemberStatus = 'PENDING' | 'ACCEPTED' | 'DENIED';
export type MemberRole = 'RECRUE' | 'PRESIDENT';

export interface Member {
  idMember?: number;
  idUser: number;
  idClub: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveauAnglais: NiveauAnglais;
  dateJoin?: string;
  status?: MemberStatus;
  role?: MemberRole;
}