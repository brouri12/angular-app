import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Challenge, SubmissionRequest, SubmissionResponse, ProficiencyLevel, ChallengeType } from '../models/challenge.model';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8888/challenge-service/api';

  // Get all challenges
  getAllChallenges(): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.apiUrl}/challenges`);
  }

  // Get challenge by ID
  getChallengeById(id: number): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.apiUrl}/challenges/${id}`);
  }

  // Get challenges by level
  getChallengesByLevel(level: ProficiencyLevel): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.apiUrl}/challenges/level/${level}`);
  }

  // Get challenges by type
  getChallengesByType(type: ChallengeType): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.apiUrl}/challenges/type/${type}`);
  }

  // Search challenges
  searchChallenges(keyword: string): Observable<Challenge[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Challenge[]>(`${this.apiUrl}/challenges/search`, { params });
  }

  // Get popular challenges
  getPopularChallenges(): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.apiUrl}/challenges/popular`);
  }

  // Submit challenge
  submitChallenge(request: SubmissionRequest): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${this.apiUrl}/submissions`, request);
  }

  // Get submission by ID
  getSubmissionById(id: number): Observable<SubmissionResponse> {
    return this.http.get<SubmissionResponse>(`${this.apiUrl}/submissions/${id}`);
  }

  // Get user submissions
  getUserSubmissions(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/submissions/user/${userId}`);
  }

  // Get user total score
  getUserTotalScore(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/submissions/user/${userId}/total-score`);
  }

  // Create challenge (for teachers)
  createChallenge(challenge: Challenge): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.apiUrl}/challenges`, challenge);
  }

  // Update challenge (for teachers)
  updateChallenge(id: number, challenge: Challenge): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.apiUrl}/challenges/${id}`, challenge);
  }

  // Delete challenge (for teachers)
  deleteChallenge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/challenges/${id}`);
  }

  // Helper methods
  getLevelLabel(level: ProficiencyLevel): string {
    const labels: { [key in ProficiencyLevel]: string } = {
      A1: 'Beginner',
      A2: 'Elementary',
      B1: 'Intermediate',
      B2: 'Upper Intermediate',
      C1: 'Advanced',
      C2: 'Proficient'
    };
    return labels[level];
  }

  getLevelColor(level: ProficiencyLevel): string {
    const colors: { [key in ProficiencyLevel]: string } = {
      A1: 'bg-green-100 text-green-800',
      A2: 'bg-blue-100 text-blue-800',
      B1: 'bg-yellow-100 text-yellow-800',
      B2: 'bg-orange-100 text-orange-800',
      C1: 'bg-red-100 text-red-800',
      C2: 'bg-purple-100 text-purple-800'
    };
    return colors[level];
  }

  getTypeIcon(type: ChallengeType): string {
    const icons: { [key in ChallengeType]: string } = {
      VOCABULARY: '📚',
      GRAMMAR: '✍️',
      READING: '📖',
      LISTENING: '👂',
      WRITING: '📝',
      SPEAKING: '🗣️',
      IDIOMS: '💬',
      MIXED: '🎯'
    };
    return icons[type];
  }
}
