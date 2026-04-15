export enum PlanificationType {
  COURS = 'COURS',
  EXAMEN = 'EXAMEN',
  REUNION = 'REUNION'
}

export enum StudentLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface Salle {
  idSalle?: number;
  nomSalle: string;
  capacite: number;
  localisation: string;
}

export interface Group {
  id?: number;
  level: StudentLevel;
  studentIds?: number[];
  teacherId?: number;
}

export interface Planification {
  idPlanification?: number;
  titre: string;
  type: PlanificationType;
  date: string; // LocalDate (YYYY-MM-DD)
  heureDebut: string; // LocalTime (HH:mm:ss)
  heureFin: string; // LocalTime
  salleId: number;
  groupId: number;
  salle?: Salle;
  group?: Group;
}
