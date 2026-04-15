// ─── Enums ────────────────────────────────────────────────────────────────────

export type NiveauCECRL = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ChallengeType = 'MOT' | 'PHRASE' | 'DIALOGUE' | 'PARAGRAPH';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type RecordingStatus = 'PENDING' | 'EVALUATED' | 'FAILED';
export type PhonemeCategory = 'CONSONANT' | 'VOWEL' | 'DIPHTHONG';

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface PronunciationChallenge {
  id: number;
  phrase: string;
  niveau: NiveauCECRL;
  type: ChallengeType;
  description?: string;
  phoneticTranscription?: string;
  audioReferenceUrl?: string;
  keywords?: string[];
  datePosted: string;
  actif: boolean;
  tips?: string;
  difficulty: DifficultyLevel;
  totalSubmissions: number;
  averageScore: number;
}

export interface UserRecording {
  id: number;
  challengeId: number;
  challengePhrase: string;
  userId: number;
  audioUrl: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  intonationScore: number;
  clarityScore: number;
  aiFeedback?: string;
  problematicPhonemes?: string[];
  submittedAt: string;
  evaluatedAt?: string;
  status: RecordingStatus;
  attemptNumber: number;
}

export interface UserProgress {
  id: number;
  userId: number;
  averageScoreA1: number;
  averageScoreA2: number;
  averageScoreB1: number;
  averageScoreB2: number;
  averageScoreC1: number;
  averageScoreC2: number;
  globalAverageScore: number;
  totalChallengesCompleted: number;
  totalRecordings: number;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate?: string;
  weakPhonemes?: string[];
  earnedBadges?: string[];
  estimatedLevel?: NiveauCECRL;
}

export interface Phoneme {
  id: number;
  symbol: string;
  name: string;
  description?: string;
  audioExampleUrl?: string;
  tipsForStudents?: string;
  category: PhonemeCategory;
  typicalLevel: NiveauCECRL;
  exampleWords?: string[];
}

export interface ChallengeStats {
  id: number;
  phrase: string;
  niveau: NiveauCECRL;
  totalSubmissions: number;
  averageScore: number;
}

export interface AudioUploadResponse {
  filename: string;
  path: string;
  size: number;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Extended interface for Admin List (adds recordings count)
export interface PronunciationChallengeWithRecordings extends PronunciationChallenge {
  recordingsCount?: number;
}