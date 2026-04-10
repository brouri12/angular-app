export type NiveauAnglais = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type MemberStatus = 'PENDING' | 'ACCEPTED' | 'DENIED';
/** Rôle dans le club (défaut côté API : recrue) */
export type MemberRole = 'RECRUE' | 'PRESIDENT';

export interface Member {
  idMember: number;
  idUser: number;
  idClub: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveauAnglais?: NiveauAnglais;
  dateJoin?: string;
  status?: MemberStatus;
  role?: MemberRole;
}

/** Unifie la forme renvoyée par l’API (camelCase / snake_case, rôle manquant). */
export function normalizeMemberFromApi(raw: any): Member {
  const r = raw?.role ?? raw?.memberRole ?? raw?.member_role;
  const role: MemberRole =
    String(r || '').toUpperCase() === 'PRESIDENT' ? 'PRESIDENT' : 'RECRUE';
  const s = String(raw?.status ?? raw?.member_status ?? '').toUpperCase();
  let status: MemberStatus | undefined;
  if (s === 'PENDING' || s === 'ACCEPTED' || s === 'DENIED') status = s as MemberStatus;
  return {
    ...raw,
    idMember: Number(raw?.idMember ?? raw?.id_member),
    idUser: Number(raw?.idUser ?? raw?.id_user),
    idClub: Number(raw?.idClub ?? raw?.id_club),
    role,
    status
  };
}