export enum ProficiencyLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export enum ChallengeType {
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR',
  READING = 'READING',
  LISTENING = 'LISTENING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
  IDIOMS = 'IDIOMS',
  MIXED = 'MIXED'
}

export enum SkillFocus {
  READING = 'READING',
  WRITING = 'WRITING',
  LISTENING = 'LISTENING',
  SPEAKING = 'SPEAKING',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_BLANK = 'FILL_BLANK',
  OPEN_ENDED = 'OPEN_ENDED',
  MATCHING = 'MATCHING',
  ORDERING = 'ORDERING'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
  REQUIRES_GRADING = 'REQUIRES_GRADING'
}

export interface Question {
  id?: number;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  explanation?: string;
  points: number;
  orderIndex: number;
  imageUrl?: string;
}

export interface Challenge {
  id?: number;
  title: string;
  description: string;
  type: ChallengeType;
  skillFocus: SkillFocus;
  level: ProficiencyLevel;
  category: string;
  points: number;
  timeLimit?: number;
  content?: string;
  questions: Question[];
  hints?: Hint[];
  createdBy?: number;
  createdAt?: string;
  isPublic: boolean;
  tags?: string;
  averageRating?: number;
  totalAttempts?: number;
  successfulCompletions?: number;
  successRate?: number;
  audioUrl?: string;
  imageUrl?: string;
}

export interface Hint {
  id?: number;
  level: number;
  content: string;
  pointsCost: number;
}

export interface SubmissionRequest {
  challengeId: number;
  userId: number;
  answers: { [questionId: number]: string };
  completionTime?: number;
  hintsUsed?: number;
  writtenResponse?: string;
}

export interface QuestionResult {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  explanation?: string;
}

export interface SubmissionResponse {
  id: number;
  challengeId: number;
  userId: number;
  status: SubmissionStatus;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  completionTime?: number;
  feedback: string;
  questionResults: { [questionId: number]: QuestionResult };
  passed: boolean;
}
