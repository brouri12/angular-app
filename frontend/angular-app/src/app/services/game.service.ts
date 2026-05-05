import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';


const BASE = 'http://localhost:8077/api';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Game {
  id: number;
  title: string;
  description: string;
  type: string;        // QUIZ | SENTENCE | CROSSWORD
  difficulty: string;  // EASY | MEDIUM | HARD
  isActive: boolean;
  questionCount: number;
  totalAttempts?: number;
  successRate?: number;
  questions?: Question[];
}

export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer?: string;  // only present for admin
  explanation?: string;
  points: number;
  orderIndex: number;
}

export interface SubmissionRequest {
  gameId: number;
  userId?: string;
  answers: Record<number, string>;  // questionId -> answer
  completionTime?: number;
}

export interface QuestionResult {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  explanation?: string;
}

export interface SubmissionResponse {  id: number;
  gameId: number;
  userId: string;
  status: string;  // PASSED | PARTIAL | FAILED
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  completionTime?: number;
  feedback: string;
  questionResults: Record<number, QuestionResult>;
  passed: boolean;
}

export interface PlayerSession {
  userId: string;
  lives: number;
  level: number;
  progressBar: number;  // 0-99 (XP within current level)
  totalXP: number;
  winStreak: number;
  bestStreak: number;
  gamesWon: number;
  gamesLost: number;
  totalGamesPlayed: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class GameService {
  private http = inject(HttpClient);
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  // ─── Games ────────────────────────────────────────────────────────────────

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${BASE}/games`)
      .pipe(timeout(15000), catchError(e => this.handleError(e, 'Failed to load games')));
  }

  getGame(id: number): Observable<Game> {
    return this.http.get<Game>(`${BASE}/games/${id}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e, 'Failed to load game')));
  }

  // ─── Submissions ──────────────────────────────────────────────────────────

  submitGame(req: SubmissionRequest): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${BASE}/submissions`, req)
      .pipe(timeout(15000), catchError(e => this.handleError(e, 'Failed to submit')));
  }

  getSubmission(id: number): Observable<SubmissionResponse> {
    return this.http.get<SubmissionResponse>(`${BASE}/submissions/${id}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e, 'Failed to load result')));
  }

  getUserSubmissions(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/submissions/user/${userId}`)
      .pipe(timeout(15000), catchError(e => this.handleError(e, 'Failed to load history')));
  }

  // ─── Session ──────────────────────────────────────────────────────────────

  getSession(): Observable<PlayerSession> {
    return this.http.get<PlayerSession>(`${BASE}/session`)
      .pipe(timeout(10000), catchError(e => this.handleError(e, 'Failed to load session')));
  }

  // ─── Error handling ───────────────────────────────────────────────────────

  private handleError(error: HttpErrorResponse, msg: string) {
    let errorMsg = msg;
    if (error.status === 0) errorMsg = 'Network error — is the backend running?';
    else if (error.status === 404) errorMsg = 'Not found';
    else if (error.status === 500) errorMsg = 'Server error';
    this.errorSubject.next(errorMsg);
    console.error(`[GameService] ${errorMsg}`, error);
    return throwError(() => new Error(errorMsg));
  }

  clearError() { this.errorSubject.next(null); }
}
