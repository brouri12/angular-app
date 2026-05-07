export type NiveauCECRL = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ChallengeType = 'MOT' | 'PHRASE' | 'DIALOGUE' | 'PARAGRAPH';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface PronunciationChallenge {
  id: number;
  phrase: string;
  phoneticTranscription?: string;
  description?: string;
  tips?: string;
  niveau: NiveauCECRL;
  type: ChallengeType;
  difficulty: DifficultyLevel;
  audioReferenceUrl?: string;
  totalSubmissions?: number;
  averageScore?: number;
  keywords?: string[];
  actif?: boolean;
}

export interface PronunciationChallengeWithRecordings extends PronunciationChallenge {
  recordingsCount: number;
}

export interface UserRecording {
  id: number;
  userId?: number;
  challengeId?: number;
  challengePhrase?: string;
  audioUrl?: string;
  overallScore?: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  intonationScore?: number;
  clarityScore?: number;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PROCESSING';
  submittedAt?: string;
  evaluatedAt?: string;
  aiFeedback?: string;
  problematicPhonemes?: string[];
  attemptNumber?: number;
}

export interface ChallengeStats {
  totalSubmissions?: number;
  averageScore?: number;
}

export interface UserProgress {
  userId?: number;
  overallAverageScore?: number;
  completedChallenges?: number;
  totalRecordings?: number;
  weakPhonemes?: string[];
  badges?: string[];
}

export interface Page<T> {
  content: T[];
  number: number;
  size?: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}
