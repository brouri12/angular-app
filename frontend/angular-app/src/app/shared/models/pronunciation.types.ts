export interface UserRecording {
  id: string;
  userId: number;
  challengeId: number;
  challengePhrase: string;
  audioUrl: string;
  overallScore?: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  intonationScore?: number;
  clarityScore?: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PROCESSING';
  submittedAt?: string;
  evaluatedAt?: string;
  aiFeedback?: string;
  problematicPhonemes?: string[];
  attemptNumber: number;
  collectionType?: string;
}

export interface PronunciationChallenge {
  id: number;
  phrase: string;
  phoneticTranscription?: string;
  description?: string;
  tips?: string;
  niveau: string;
  type: string;
  difficulty: string;
  audioReferenceUrl?: string;
  totalSubmissions: number;
  averageScore: number;
}

export type NiveauCECRL = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ChallengeType = 'minimal pairs' | 'sentence fluency' | 'dialogue intonation' | 'phoneme focus';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

