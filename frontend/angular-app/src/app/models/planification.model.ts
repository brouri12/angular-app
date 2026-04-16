export interface Group {
  id?: number;
  level: StudentLevel;
  studentIds?: number[];
  teacherId?: number;
  teacherName?: string;
}

export interface Student {
  id: number;
  name: string;
  level: StudentLevel;
  groupId?: number;
}

export interface Teacher {
  id: number;
  name: string;
  speciality: string;
}

export enum StudentLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export interface Planification {
  idPlanification?: number;
  titre: string;
  type: PlanificationType;
  date: string;
  heureDebut: string;
  heureFin: string;
  salleId: number;
  salleNom?: string;
  groupId: number;
  groupLevel?: string;
}

export enum PlanificationType {
  COURS = 'COURS',
  EXAMEN = 'EXAMEN',
  REUNION = 'REUNION'
}

export interface Salle {
  idSalle?: number;
  nomSalle: string;
  capacite: number;
  localisation: string;
}
