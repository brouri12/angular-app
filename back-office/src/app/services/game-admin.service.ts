import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Game {
  id?: number;
  title: string;
  type: 'QUIZ' | 'SENTENCE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  isActive?: boolean;
  description: string;
  questionCount?: number;
}

export interface GameContent {
  id?: number;
  gameId?: number;
  questionText: string;
  correctAnswer: string;
  options: string[];   // real array — matches backend QuestionDTO
  explanation: string;
  points?: number;
  orderIndex?: number;
}

export interface AdminStats {
  totalGames: number;
  activeGames: number;
  totalContent: number;
}

export interface PlayerSession {
  userId: string;
  lives: number;
  level: number;
  progressBar: number;
  totalXP: number;
  winStreak: number;
  gamesWon: number;
  gamesLost: number;
  totalGamesPlayed: number;
  gameOver: boolean;
}

@Injectable({ providedIn: 'root' })
export class GameAdminService {
  private http = inject(HttpClient);
  private base = `${environment.gameServiceUrl}/api/admin`;
  private sessionBase = `${environment.gameServiceUrl}/api/session`;

  // ─── Games CRUD ───────────────────────────────────────────────────────────
  getGames(): Observable<Game[]> { return this.http.get<Game[]>(`${this.base}/games`); }
  createGame(g: Game): Observable<Game> { return this.http.post<Game>(`${this.base}/games`, g); }
  updateGame(id: number, g: Game): Observable<Game> { return this.http.put<Game>(`${this.base}/games/${id}`, g); }
  deleteGame(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/games/${id}`); }
  toggleGame(id: number): Observable<Game> { return this.http.patch<Game>(`${this.base}/games/${id}/toggle`, {}); }

  // ─── Content CRUD ─────────────────────────────────────────────────────────
  getContent(gameId: number): Observable<GameContent[]> { return this.http.get<GameContent[]>(`${this.base}/games/${gameId}/questions`); }
  addContent(gameId: number, c: GameContent): Observable<GameContent> { return this.http.post<GameContent>(`${this.base}/games/${gameId}/questions`, c); }
  updateContent(id: number, c: GameContent): Observable<GameContent> { return this.http.put<GameContent>(`${this.base}/questions/${id}`, c); }
  deleteContent(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/questions/${id}`); }

  // ─── Stats ────────────────────────────────────────────────────────────────
  getStats(): Observable<AdminStats> { return this.http.get<AdminStats>(`${this.base}/stats`); }

  // ─── Player sessions ──────────────────────────────────────────────────────
  getPlayerSession(userId: string): Observable<PlayerSession> { return this.http.get<PlayerSession>(`${this.sessionBase}/${userId}`); }
  resetPlayerSession(userId: string): Observable<PlayerSession> { return this.http.post<PlayerSession>(`${this.sessionBase}/${userId}/reset`, {}); }
}
