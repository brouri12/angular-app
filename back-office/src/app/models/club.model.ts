export type ClubType = 'ONLINE' | 'PRESENTIEL';

export interface Club {
  idClub?: number;
  nomClub: string;
  description?: string;
  type: ClubType;
  ville?: string;
  dateCreation?: string;
  logo?: string;
}
