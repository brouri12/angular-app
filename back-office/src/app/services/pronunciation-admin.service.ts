import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { PronunciationChallenge, ChallengeStats, Page, UserProgress, UserRecording } from '../../models/pronunciation.types';

/**
 * PronunciationAdminService - Admin endpoints only
 */
@Injectable({
  providedIn: 'root'
})
export class PronunciationAdminService {
  private readonly base = `${environment.apiUrl}/api/pronunciation`;

  constructor(private http: HttpClient) {}

  // ====================== CHALLENGES ADMIN ======================

  createChallenge(challenge: PronunciationChallenge): Observable<PronunciationChallenge> {
    return this.http.post<PronunciationChallenge>(`${this.base}/challenges`, challenge).pipe(
      catchError(this.handleError<PronunciationChallenge>('createChallenge'))
    );
  }

  updateChallenge(id: number, challenge: PronunciationChallenge): Observable<PronunciationChallenge> {
    return this.http.put<PronunciationChallenge>(`${this.base}/challenges/${id}`, challenge).pipe(
      catchError(this.handleError<PronunciationChallenge>('updateChallenge'))
    );
  }

  deleteChallenge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/challenges/${id}`).pipe(
      catchError(this.handleError<void>('deleteChallenge'))
    );
  }
    getChallengeById(id: number): Observable<PronunciationChallenge> {
    return this.http.get<PronunciationChallenge>(`${this.base}/challenges/${id}`);
  }

  getChallengeStats(id: number): Observable<ChallengeStats> {
    return this.http.get<ChallengeStats>(`${this.base}/challenges/${id}/stats`).pipe(
      catchError(this.handleError<ChallengeStats>('getChallengeStats'))
    );
  }

  /** Matches exactly: GET /api/pronunciation/challenges?page=0&size=10 */
  getAllChallenges(
    page: number = 0,
    size: number = 10
  ): Observable<Page<PronunciationChallenge>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<PronunciationChallenge>>(`${this.base}/challenges`, { params }).pipe(
      catchError(this.handleError<Page<PronunciationChallenge>>('getAllChallenges'))
    );
  }

  /** Global admin stats - keep if you have this endpoint elsewhere */
  getGlobalStats(): Observable<any> {
    return this.http.get<any>(`${this.base}/admin/stats`).pipe(
      catchError(this.handleError<any>('getGlobalStats'))
    );
  }

  getLeaderboard(niveau?: string, limit: number = 10): Observable<any[]> {
    let params = new HttpParams().set('limit', limit.toString());
    if (niveau) params = params.set('niveau', niveau);

    return this.http.get<any[]>(`${this.base}/progress/leaderboard`, { params }).pipe(
      catchError(this.handleError<any[]>('getLeaderboard'))
    );
  }

  // ====================== STUDENT PROFILES ======================

  getStudentPronunciation(userId: number): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.base}/admin/students/${userId}/pronunciation`).pipe(
      catchError(this.handleError<UserProgress>('getStudentPronunciation'))
    );
  }

  getStudentRecordings(
    userId: number,
    page: number = 0,
    size: number = 10
  ): Observable<Page<UserRecording>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<UserRecording>>(`${this.base}/admin/students/${userId}/recordings`, { params }).pipe(
      catchError(this.handleError<Page<UserRecording>>('getStudentRecordings'))
    );
  }

  getChallengeRecordings(challengeId: number): Observable<UserRecording[]> {
    return this.http.get<UserRecording[]>(`${this.base}/admin/challenges/${challengeId}/recordings`).pipe(
      catchError(this.handleError<UserRecording[]>('getChallengeRecordings'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}