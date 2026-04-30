import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface StudentModel {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface LessonModel {
  id: number;
  title?: string;
  type?: string;
  url?: string;
  durationMinutes?: number;
  sortOrder?: number;
}

export interface QuizQuestionModel {
  id: number;
  questionText?: string;
  questionType?: string;
}

export interface QuizModel {
  id?: number;
  title?: string;
  timeLimitSeconds?: number;
  timeLimitMinutes?: number;
  questions?: QuizQuestionModel[];
}

export interface ChapterModel {
  id: number;
  title?: string;
  sortOrder?: number;
  lessons?: LessonModel[];
  quiz?: QuizModel | null;
  quizzes?: QuizModel[] | null;
}

export interface LevelModel {
  id: number;
  code?: string;
  name?: string;
  sortOrder?: number;
  imageUrl?: string;
  chapters?: ChapterModel[];
}

export interface PointsModel {
  totalPoints: number;
}

export interface BadgeModel {
  id?: number;
  badgeName?: string;
  badgeLevel?: string;
  description?: string;
  earnedDate?: string;
}

export interface HistorySummaryModel {
  totalEnrollments: number;
  coursesCompleted: number;
  coursesInProgress: number;
  coursesNotStarted: number;
  totalQuizAttempts: number;
  totalCatalogResponses: number;
  averageQuizScorePercent: number | null;
}

export interface HistoryTimelineItem {
  createdAt?: string;
  eventType?: string;
  title?: string;
  scorePercent?: number | null;
}

export interface EnrollmentRowModel {
  id: number;
  courseId?: number;
  courseTitle?: string;
  status?: string;
  completionPercentage?: number;
  finalGrade?: number | null;
}

export interface HistoryModel {
  summary?: Partial<HistorySummaryModel>;
  timeline?: HistoryTimelineItem[];
  enrollments?: EnrollmentRowModel[];
  quizAttempts?: Array<{ chapterId?: number; levelCode?: string }>;
}

export interface CourseModel {
  id: number;
  title?: string;
  teacherName?: string;
  level?: string;
  price?: number;
  status?: string;
  description?: string;
  durationHours?: number;
  averageRating?: number;
  feedbackCount?: number;
}

export interface CourseMaterialModel {
  title?: string;
  url?: string;
  type?: string;
}

export interface CatalogQuestionModel {
  id: number;
  questionText?: string;
}

export interface QuizAttemptResultModel {
  passed?: boolean;
  scorePercent?: number;
  pointsEarned?: number;
  totalPoints?: number;
  newBadges?: Array<{ badgeName?: string }>;
}

export interface StudentQuizAttemptModel {
  id: number;
  studentId?: number;
  quizId?: number;
  scorePercent?: number | null;
  pointsEarned?: number | null;
  status?: string;
}

export interface CoachChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StudentNotificationModel {
  id: number;
  type?: string;
  courseId?: number | null;
  courseTitle?: string;
  createdAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private static readonly GET_MS = 10000;
  private static readonly POST_MS = 25000;

  constructor(private readonly http: HttpClient) {}

  async getStudents(): Promise<StudentModel[]> {
    return this.get<StudentModel[]>('/api/students');
  }

  async getPedagogyTree(): Promise<LevelModel[]> {
    return this.get<LevelModel[]>('/api/pedagogy/tree');
  }

  async getPoints(studentId: number): Promise<PointsModel> {
    return this.get<PointsModel>(`/api/students/${studentId}/points`);
  }

  async getBadges(studentId: number): Promise<BadgeModel[]> {
    return this.get<BadgeModel[]>(`/api/badges?studentId=${studentId}`);
  }

  async getHistory(studentId: number): Promise<HistoryModel> {
    return this.get<HistoryModel>(`/api/history/student?studentId=${studentId}`);
  }

  async getCourses(): Promise<CourseModel[]> {
    return this.get<CourseModel[]>(`/api/courses?t=${Date.now()}`);
  }

  async getCourse(id: number): Promise<CourseModel> {
    return this.get<CourseModel>(`/api/courses/${id}`);
  }

  async getCourseMaterials(id: number): Promise<CourseMaterialModel[]> {
    return this.get<CourseMaterialModel[]>(`/api/courses/${id}/materials`);
  }

  async getEnrollments(studentId: number): Promise<EnrollmentRowModel[]> {
    return this.get<EnrollmentRowModel[]>(`/api/enrollments?studentId=${studentId}`);
  }

  async postEnrollment(body: {
    studentId: number;
    courseId: number;
    status: string;
    completionPercentage: number;
  }): Promise<unknown> {
    return this.postJson<unknown>('/api/enrollments', body);
  }

  async putEnrollment(
    enrollmentId: number,
    body: { status: string; completionPercentage: number; finalGrade: null }
  ): Promise<unknown> {
    return this.putJson<unknown>(`/api/enrollments/${enrollmentId}`, body);
  }

  async getCatalogQuestions(courseId: number): Promise<CatalogQuestionModel[]> {
    return this.get<CatalogQuestionModel[]>(`/api/questions?courseId=${courseId}`);
  }

  async postResponse(body: {
    studentId: number;
    questionId: number;
    answerText: string;
  }): Promise<unknown> {
    return this.postJson<unknown>('/api/responses', body);
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestionModel[]> {
    return this.get<QuizQuestionModel[]>(`/api/quizzes/${quizId}/questions`);
  }

  async getQuiz(quizId: number): Promise<QuizModel> {
    return this.get<QuizModel>(`/api/quizzes/${quizId}`);
  }

  async getChapterQuizzes(chapterId: number): Promise<QuizModel[]> {
    return this.get<QuizModel[]>(`/api/chapters/${chapterId}/quizzes`);
  }

  async completeLesson(studentId: number, lessonId: number): Promise<void> {
    await this.postJson<unknown>(`/api/students/${studentId}/lessons/${lessonId}/complete`, {});
  }

  async postQuizAttempt(body: {
    studentId: number;
    quizId: number;
    answers: Array<{ questionId: number; answerText: string }>;
    durationSeconds?: number;
  }): Promise<QuizAttemptResultModel> {
    return this.postJson<QuizAttemptResultModel>('/api/quiz-attempts', body);
  }

  async getLatestQuizAttempt(studentId: number, quizId: number): Promise<StudentQuizAttemptModel | null> {
    const list = await this.get<StudentQuizAttemptModel[]>(`/api/quiz-attempts?studentId=${studentId}&quizId=${quizId}`);
    if (!Array.isArray(list) || !list.length) return null;
    return list[0] ?? null;
  }

  async getNotifications(limit = 30): Promise<StudentNotificationModel[]> {
    return this.get<StudentNotificationModel[]>(`/api/notifications?limit=${Math.max(1, limit)}`);
  }

  async deleteNotification(id: number): Promise<void> {
    await this.deleteJson(`/api/notifications/${id}`);
  }

  async deleteAllNotifications(): Promise<void> {
    await this.deleteJson('/api/notifications');
  }

  /**
   * Coach etudiant : meme strategie que student.html (fetch, plusieurs bases/ports,
   * chemins /api/chatbot/student et /api/auth/chatbot/student, corps { message, history }).
   */
  async postStudentCoach(message: string, history: CoachChatMessage[]): Promise<string> {
    const payload = { message, history };
    const paths = ['/api/chatbot/student', '/api/auth/chatbot/student'];
    const errors: string[] = [];
    const tried = new Set<string>();

    for (const base of this.getCoachCandidateBases()) {
      for (const path of paths) {
        const url = `${base}${path}`;
        if (tried.has(url)) continue;
        tried.add(url);
        try {
          const ac = new AbortController();
          const t = window.setTimeout(() => ac.abort(), StudentApiService.POST_MS);
          const r = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify(payload),
            signal: ac.signal,
            credentials: 'omit'
          });
          window.clearTimeout(t);
          const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
          const text = this.coachReplyFromResponseBody(j);
          if (r.ok && text) return text;
          if (text) return text;
          if (!r.ok) errors.push(`HTTP ${r.status} ${url}`);
        } catch (e) {
          const err = e as Error;
          errors.push(err?.name === 'AbortError' ? 'Timeout coach' : err?.message || 'Erreur reseau');
        }
      }
    }
    throw new Error(errors.length ? errors[errors.length - 1]! : 'Coach indisponible');
  }

  private coachReplyFromResponseBody(j: Record<string, unknown>): string | null {
    if (!j) return null;
    const reply = j['reply'];
    if (reply != null && String(reply).trim()) return String(reply);
    const err = j['error'] ?? j['message'];
    if (err != null && String(err).trim()) return String(err);
    return null;
  }

  /** Bases comme student.html : '' si meme origine que l API, puis localhost:8083–8086. */
  private getCoachCandidateBases(): string[] {
    const port = window.location.port;
    const bases: string[] = [];
    if (port === '4200' || port === '4300') {
      bases.push('');
    } else if (['8081', '8083', '8084', '8085', '8086'].includes(port)) {
      bases.push('');
    } else {
      bases.push('http://localhost:8083');
    }
    for (const p of ['8083', '8084', '8085', '8086']) {
      bases.push(`http://localhost:${p}`);
    }
    return [...new Set(bases)];
  }

  /**
   * Explication d un mot EN via le backend (student.html / dashboard : POST /api/english/explain-word).
   * Evite l API externe du dictionnaire (souvent HTML / JSON invalide en SPA).
   */
  async tryExplainEnglishWord(word: string): Promise<string | null> {
    const text = word.trim().slice(0, 120);
    if (!text) return null;
    for (const base of this.getCandidateBases()) {
      try {
        const url = `${base}/api/english/explain-word`;
        const ac = new AbortController();
        const t = window.setTimeout(() => ac.abort(), StudentApiService.POST_MS);
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ text }),
          signal: ac.signal,
          credentials: 'omit'
        });
        window.clearTimeout(t);
        const raw = await r.text();
        const body = raw.trim();
        if (!body || body.startsWith('<')) continue;
        let j: Record<string, unknown>;
        try {
          j = JSON.parse(body) as Record<string, unknown>;
        } catch {
          continue;
        }
        if (r.ok && j['ok'] === true && j['explanation'] != null) {
          return String(j['explanation']).trim() || null;
        }
      } catch {
        /* base suivante */
      }
    }
    return null;
  }

  private async get<T>(path: string): Promise<T> {
    const lastErrorMessages: string[] = [];
    for (const base of this.getCandidateBases()) {
      try {
        return await firstValueFrom(
          this.http
            .get<T>(`${base}${path}`)
            .pipe(timeout({ first: StudentApiService.GET_MS }))
        );
      } catch (error) {
        lastErrorMessages.push(this.httpErrorMessage(error));
      }
    }
    throw new Error(lastErrorMessages[lastErrorMessages.length - 1] ?? 'API indisponible');
  }

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    return this.exchange<T>('POST', path, body);
  }

  private async putJson<T>(path: string, body: unknown): Promise<T> {
    return this.exchange<T>('PUT', path, body);
  }

  private async deleteJson(path: string): Promise<void> {
    const lastErrorMessages: string[] = [];
    for (const base of this.getCandidateBases()) {
      try {
        await firstValueFrom(
          this.http
            .delete<unknown>(`${base}${path}`)
            .pipe(timeout({ first: StudentApiService.POST_MS }))
        );
        return;
      } catch (error) {
        lastErrorMessages.push(this.httpErrorMessage(error));
      }
    }
    throw new Error(lastErrorMessages[lastErrorMessages.length - 1] ?? 'API indisponible');
  }

  private async exchange<T>(method: 'POST' | 'PUT', path: string, body: unknown): Promise<T> {
    const lastErrorMessages: string[] = [];
    for (const base of this.getCandidateBases()) {
      try {
        const url = `${base}${path}`;
        const obs =
          method === 'POST'
            ? this.http.post<T>(url, body, { headers: { 'Content-Type': 'application/json' } })
            : this.http.put<T>(url, body, { headers: { 'Content-Type': 'application/json' } });
        return await firstValueFrom(obs.pipe(timeout({ first: StudentApiService.POST_MS })));
      } catch (error) {
        lastErrorMessages.push(this.httpErrorMessage(error));
      }
    }
    throw new Error(lastErrorMessages[lastErrorMessages.length - 1] ?? 'API indisponible');
  }

  private httpErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (body && typeof body === 'object') {
        const o = body as { error?: string; message?: string };
        if (o.error && String(o.error).trim()) return String(o.error);
        if (o.message && String(o.message).trim()) return String(o.message);
      }
      if (typeof body === 'string' && body.length < 300) return body;
      return error.message || `HTTP ${error.status}`;
    }
    return (error as { message?: string })?.message ?? 'Erreur reseau';
  }

  private getCandidateBases(): string[] {
    const port = window.location.port;
    if (port === '4200' || port === '4300') {
      return ['', 'http://localhost:8083'];
    }
    const fromApiPort = ['8081', '8083', '8084', '8085', '8086'].includes(port) ? '' : 'http://localhost:8083';
    const list = [fromApiPort, '', 'http://localhost:8083', 'http://localhost:8084'];
    return [...new Set(list)];
  }
}
