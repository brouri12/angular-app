import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Page, NiveauCECRL, ChallengeType, ChallengeStats, AudioUploadResponse, Phoneme, PronunciationChallenge, UserProgress, UserRecording, CollectionType } from '../../shared/models/pronunciation.types';

/**
 * PronunciationService
 * Consumes the Spring Boot pronunciation microservice.
 * Base URL should be routed through your API Gateway / reverse proxy.
 * Keycloak token is attached automatically via an HTTP interceptor (KeycloakBearerInterceptor).
 */
@Injectable({ providedIn: 'root' })
export class PronunciationService {
  private readonly base = `${environment.apiUrl}/api/pronunciation`;

  constructor(private http: HttpClient) {}

  // ─── Challenges ─────────────────────────────────────────────────────────────

  /** GET /challenges?page=0&size=20 */
  getChallenges(page = 0, size = 20): Observable<Page<PronunciationChallenge>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<PronunciationChallenge>>(`${this.base}/challenges`, { params });
  }

  /** GET /challenges/active */
  getActiveChallenges(): Observable<PronunciationChallenge[]> {
    return this.http.get<PronunciationChallenge[]>(`${this.base}/challenges/active`,);
  }

  /** GET /challenges/:id */
  getChallengeById(id: number): Observable<PronunciationChallenge> {
    return this.http.get<PronunciationChallenge>(`${this.base}/challenges/${id}`);
  }

  /** GET /challenges/random?niveau=B1 */
  getRandomChallenge(niveau?: NiveauCECRL): Observable<PronunciationChallenge> {
    let params = new HttpParams();
    if (niveau) params = params.set('niveau', niveau);
    return this.http.get<PronunciationChallenge>(`${this.base}/challenges/random`, { params });
  }

  /** GET /challenges/niveau/:niveau */
  getChallengesByNiveau(niveau: NiveauCECRL): Observable<PronunciationChallenge[]> {
    return this.http.get<PronunciationChallenge[]>(`${this.base}/challenges/niveau/${niveau}`);
  }

  /** GET /challenges/type/:type */
  getChallengesByType(type: ChallengeType): Observable<PronunciationChallenge[]> {
    return this.http.get<PronunciationChallenge[]>(`${this.base}/challenges/type/${type}`);
  }

  /** GET /challenges/search?keyword=th */
  searchChallenges(keyword: string): Observable<PronunciationChallenge[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<PronunciationChallenge[]>(`${this.base}/challenges/search`, { params });
  }

  /** GET /challenges/most-successful?limit=10 */
  getMostSuccessfulChallenges(limit = 10): Observable<PronunciationChallenge[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<PronunciationChallenge[]>(`${this.base}/challenges/most-successful`, { params });
  }

  /** GET /challenges/most-failed?limit=10 */
  getMostFailedChallenges(limit = 10): Observable<PronunciationChallenge[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<PronunciationChallenge[]>(`${this.base}/challenges/most-failed`, { params });
  }

  /** GET /challenges/:id/stats */
  getChallengeStats(id: number): Observable<ChallengeStats> {
    return this.http.get<ChallengeStats>(`${this.base}/challenges/${id}/stats`);
  }

  /** POST /challenges */
  createChallenge(challenge: Partial<PronunciationChallenge>): Observable<PronunciationChallenge> {
    return this.http.post<PronunciationChallenge>(`${this.base}/challenges`, challenge);
  }

  /** PUT /challenges/:id */
  updateChallenge(id: number, challenge: Partial<PronunciationChallenge>): Observable<PronunciationChallenge> {
    return this.http.put<PronunciationChallenge>(`${this.base}/challenges/${id}`, challenge);
  }

  /** DELETE /challenges/:id */
  deleteChallenge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/challenges/${id}`);
  }

  /** POST /challenges/seed */
  seedDefaultChallenges(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/challenges/seed`, {});
  }

  // ─── Recordings ─────────────────────────────────────────────────────────────

  /**
   * POST /recordings (multipart/form-data)
   * Submits an audio recording for a challenge.
   */
  submitRecording(challengeId: number, userId: number, audioFile: File): Observable<UserRecording> {
    const form = new FormData();
    form.append('challengeId', String(challengeId));
    form.append('userId', String(userId));
    form.append('audioFile', audioFile, audioFile.name);
    return this.http.post<UserRecording>(`${this.base}/recordings`, form);
  }

  /** GET /recordings/:id */
  getRecordingById(id: number): Observable<UserRecording> {
    return this.http.get<UserRecording>(`${this.base}/recordings/${id}`);
  }

  /** GET /recordings/user/:userId?page=0&size=20&collection=PERFECT */
  getUserRecordings(userId: number, page = 0, size = 20, collection?: CollectionType): Observable<Page<UserRecording>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (collection) {
      params = params.set('collection', collection);
    }
    return this.http.get<Page<UserRecording>>(`${this.base}/recordings/user/${userId}`, { params });
  }

  /** GET /recordings/challenge/:challengeId?page=0&size=20 */
  getChallengeRecordings(challengeId: number, page = 0, size = 20): Observable<Page<UserRecording>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<UserRecording>>(`${this.base}/recordings/challenge/${challengeId}`, { params });
  }

  /** PUT /recordings/:id (re-record) */
  updateRecording(id: number, newAudioFile: File): Observable<UserRecording> {
    const form = new FormData();
    form.append('newAudioFile', newAudioFile, newAudioFile.name);
    return this.http.put<UserRecording>(`${this.base}/recordings/${id}`, form);
  }

  /** DELETE /recordings/:id */
  deleteRecording(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/recordings/${id}`);
  }

  // ─── Audio ───────────────────────────────────────────────────────────────────

  /** POST /audio/upload */
  uploadAudio(audioFile: File): Observable<AudioUploadResponse> {
    const form = new FormData();
    form.append('audioFile', audioFile, audioFile.name);
    return this.http.post<AudioUploadResponse>(`${this.base}/audio/upload`, form);
  }

  /** GET /audio/:filename — returns audio resource URL */
  getAudioFileUrl(filename: string): string {
    return `${this.base}/audio/${filename}`;
  }

  // ─── Progress ────────────────────────────────────────────────────────────────

  /** GET /progress/user/:userId */
  getUserProgress(userId: number): Observable<UserProgress> {
    return this.http.get<UserProgress>(`${this.base}/progress/user/${userId}`);
  }

  /** GET /progress/leaderboard?niveau=B1&limit=10 */
  getLeaderboard(niveau?: NiveauCECRL, limit = 10): Observable<UserProgress[]> {
    let params = new HttpParams().set('limit', limit);
    if (niveau) params = params.set('niveau', niveau);
    return this.http.get<UserProgress[]>(`${this.base}/progress/leaderboard`, { params });
  }

  /** GET /progress/user/:userId/weak-phonemes */
  getWeakPhonemes(userId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/progress/user/${userId}/weak-phonemes`);
  }

  /** GET /progress/user/:userId/badges */
  getBadges(userId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/progress/user/${userId}/badges`);
  }

  // ─── Phonemes ────────────────────────────────────────────────────────────────

  /** GET /phonemes */
  getPhonemes(): Observable<Phoneme[]> {
    return this.http.get<Phoneme[]>(`${this.base}/phonemes`);
  }

  /** GET /phonemes/:symbol */
  getPhonemeBySymbol(symbol: string): Observable<Phoneme> {
    return this.http.get<Phoneme>(`${this.base}/phonemes/${symbol}`);
  }
}