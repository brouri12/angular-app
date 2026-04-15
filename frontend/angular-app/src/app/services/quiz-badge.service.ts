import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../core/api.config';

/** Données quiz (aligné sur l’API Spring / Node). */
export interface QuizQuestionDTO {
  id?: number;
  courseId?: number;
  questionText?: string;
}

/** Données badge (aligné sur l’API Spring / Node). */
export interface StudentBadgeDTO {
  id?: number;
  studentId?: number;
  badgeName?: string;
}

/**
 * Accès HTTP aux ressources quiz (questions) et badges.
 */
@Injectable({ providedIn: 'root' })
export class QuizBadgeService {
  private readonly base = API_BASE_URL;

  constructor(private http: HttpClient) {}

  /** Questions d’un cours (ex. GET /api/questions/course/{courseId}). */
  getQuestionsForCourse(courseId: number): Observable<QuizQuestionDTO[]> {
    return this.http.get<QuizQuestionDTO[]>(
      `${this.base}${API_ENDPOINTS.questions}/course/${courseId}`,
    );
  }

  /** Badges d’un étudiant (ex. GET /api/badges/student/{studentId}). */
  getBadgesForStudent(studentId: number): Observable<StudentBadgeDTO[]> {
    return this.http.get<StudentBadgeDTO[]>(
      `${this.base}${API_ENDPOINTS.badges}/student/${studentId}`,
    );
  }

  /** Liste globale des badges (ex. GET /api/badges). */
  getAllBadges(): Observable<StudentBadgeDTO[]> {
    return this.http.get<StudentBadgeDTO[]>(`${this.base}${API_ENDPOINTS.badges}`);
  }
}
