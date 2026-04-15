export interface PronunciationChallenge {
  id: number;
  phrase: string;
  niveau: string;
  type: string;
  description?: string;
  phoneticTranscription?: string;
  audioReferenceUrl?: string;
  difficulty?: string;
  keywords?: string[];
  datePosted?: Date;
}

export interface UserRecording {
  id: number;
  challengeId: number;
  overallScore?: number;
  pronunciationScore?: number;
  fluencyScore?: number;
  aiFeedback?: string;
}

export interface UserProgress {
  globalAverageScore?: number;
  currentStreak?: number;
  totalChallengesCompleted?: number;
  totalRecordings?: number;
  weakPhonemes?: string[];
}

