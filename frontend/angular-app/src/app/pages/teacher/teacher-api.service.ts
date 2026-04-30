import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

export interface TeacherCourseModel {
  id: number;
  courseCode?: string;
  title?: string;
  teacherName?: string;
  price?: number | null;
  level?: string;
  description?: string;
  durationHours?: number | null;
  status?: string;
}

export interface TeacherQuestionModel {
  id: number;
  courseId?: number;
  quizId?: number;
  questionText?: string;
  questionType?: string;
  correctAnswer?: string;
  points?: number;
  orderNumber?: number;
  explanation?: string | null;
}

export interface TeacherMaterialModel {
  id: number;
  courseId: number;
  title?: string;
  type?: string;
  url?: string;
}

export interface TeacherEnrollmentModel {
  id: number;
  studentId?: number;
  courseId?: number;
  courseTitle?: string;
  status?: string;
  completionPercentage?: number;
  finalGrade?: number | null;
}

export interface TeacherLevelModel {
  id: number;
  code?: string;
  name?: string;
  imageUrl?: string | null;
}

export interface TeacherChapterModel {
  id: number;
  levelId?: number;
  title?: string;
}

export interface TeacherLessonModel {
  id: number;
  chapterId?: number;
  title?: string;
  type?: string;
  url?: string;
  durationMinutes?: number;
}

export interface TeacherQuizModel {
  id: number;
  chapterId?: number;
  title?: string;
  passingScorePercent?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
}

@Injectable({ providedIn: 'root' })
export class TeacherApiService {
  private static readonly GET_MS = 10000;
  private static readonly WRITE_MS = 25000;

  constructor(private readonly http: HttpClient) {}

  async getCourses(): Promise<TeacherCourseModel[]> {
    return this.get<TeacherCourseModel[]>('/api/courses');
  }

  async getCourse(id: number): Promise<TeacherCourseModel> {
    return this.get<TeacherCourseModel>(`/api/courses/${id}`);
  }

  async createCourse(body: Record<string, unknown>): Promise<unknown> {
    return this.post<unknown>('/api/courses', body);
  }

  async updateCourse(id: number, body: Record<string, unknown>): Promise<unknown> {
    return this.put<unknown>(`/api/courses/${id}`, body);
  }

  async deleteCourse(id: number): Promise<void> {
    await this.delete(`/api/courses/${id}`);
  }

  async getQuestions(courseId: number): Promise<TeacherQuestionModel[]> {
    return this.get<TeacherQuestionModel[]>(`/api/questions?courseId=${courseId}&includeInactive=1`);
  }

  async getQuestion(id: number): Promise<TeacherQuestionModel> {
    return this.get<TeacherQuestionModel>(`/api/questions/${id}`);
  }

  async createQuestion(body: Record<string, unknown>): Promise<unknown> {
    return this.post<unknown>('/api/questions', body);
  }

  async updateQuestion(id: number, body: Record<string, unknown>): Promise<unknown> {
    return this.put<unknown>(`/api/questions/${id}`, body);
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.delete(`/api/questions/${id}`);
  }

  async getMaterials(courseId: number): Promise<TeacherMaterialModel[]> {
    return this.get<TeacherMaterialModel[]>(`/api/courses/${courseId}/materials`);
  }

  async getMaterial(id: number): Promise<TeacherMaterialModel> {
    return this.get<TeacherMaterialModel>(`/api/materials/${id}`);
  }

  async createMaterial(courseId: number, body: Record<string, unknown>): Promise<unknown> {
    return this.post<unknown>(`/api/courses/${courseId}/materials`, body);
  }

  async updateMaterial(id: number, body: Record<string, unknown>): Promise<unknown> {
    return this.put<unknown>(`/api/materials/${id}`, body);
  }

  async deleteMaterial(id: number): Promise<void> {
    await this.delete(`/api/materials/${id}`);
  }

  async getEnrollments(): Promise<TeacherEnrollmentModel[]> {
    return this.get<TeacherEnrollmentModel[]>('/api/enrollments');
  }

  async getResponses(): Promise<unknown[]> {
    return this.get<unknown[]>('/api/responses');
  }

  async getLevels(): Promise<TeacherLevelModel[]> {
    return this.get<TeacherLevelModel[]>('/api/levels');
  }

  async getLevel(id: number): Promise<TeacherLevelModel> {
    return this.get<TeacherLevelModel>(`/api/levels/${id}`);
  }

  async createLevel(body: Record<string, unknown>): Promise<TeacherLevelModel> {
    return this.post<TeacherLevelModel>('/api/levels', body);
  }

  async updateLevel(id: number, body: Record<string, unknown>): Promise<unknown> {
    return this.put<unknown>(`/api/levels/${id}`, body);
  }

  async deleteLevel(id: number): Promise<void> {
    await this.delete(`/api/levels/${id}`);
  }

  async getChapters(levelId: number): Promise<TeacherChapterModel[]> {
    return this.get<TeacherChapterModel[]>(`/api/levels/${levelId}/chapters`);
  }

  async getChapter(id: number): Promise<TeacherChapterModel> {
    return this.get<TeacherChapterModel>(`/api/chapters/${id}`);
  }

  async createChapter(levelId: number, body: Record<string, unknown>): Promise<TeacherChapterModel> {
    return this.post<TeacherChapterModel>(`/api/levels/${levelId}/chapters`, body);
  }

  async updateChapter(id: number, body: Record<string, unknown>): Promise<unknown> {
    return this.put<unknown>(`/api/chapters/${id}`, body);
  }

  async deleteChapter(id: number): Promise<void> {
    await this.delete(`/api/chapters/${id}`);
  }

  async getLessons(chapterId: number): Promise<TeacherLessonModel[]> {
    return this.get<TeacherLessonModel[]>(`/api/chapters/${chapterId}/lessons`);
  }

  async createLesson(chapterId: number, body: Record<string, unknown>): Promise<unknown> {
    return this.post<unknown>(`/api/chapters/${chapterId}/lessons`, body);
  }

  async updateLesson(id: number, body: Record<string, unknown>): Promise<unknown> {
    return this.put<unknown>(`/api/lessons/${id}`, body);
  }

  async deleteLesson(id: number): Promise<void> {
    await this.delete(`/api/lessons/${id}`);
  }

  async getChapterQuiz(chapterId: number): Promise<TeacherQuizModel | null> {
    return this.get<TeacherQuizModel | null>(`/api/chapters/${chapterId}/quiz`);
  }

  async getChapterQuizzes(chapterId: number): Promise<TeacherQuizModel[]> {
    return this.get<TeacherQuizModel[]>(`/api/chapters/${chapterId}/quizzes`);
  }

  async getQuizQuestions(quizId: number): Promise<TeacherQuestionModel[]> {
    return this.get<TeacherQuestionModel[]>(`/api/quizzes/${quizId}/questions`);
  }

  async createQuiz(chapterId: number, body: Record<string, unknown>): Promise<TeacherQuizModel> {
    return this.post<TeacherQuizModel>(`/api/chapters/${chapterId}/quizzes`, body);
  }

  async updateQuiz(id: number, body: Record<string, unknown>): Promise<TeacherQuizModel> {
    return this.put<TeacherQuizModel>(`/api/quizzes/${id}`, body);
  }

  async deleteQuiz(id: number): Promise<void> {
    await this.delete(`/api/quizzes/${id}`);
  }

  async createQuizQuestion(quizId: number, body: Record<string, unknown>): Promise<TeacherQuestionModel> {
    return this.post<TeacherQuestionModel>(`/api/quizzes/${quizId}/questions`, body);
  }

  async updateQuizQuestion(id: number, body: Record<string, unknown>): Promise<TeacherQuestionModel> {
    return this.put<TeacherQuestionModel>(`/api/quiz-questions/${id}`, body);
  }

  async deleteQuizQuestion(id: number): Promise<void> {
    await this.delete(`/api/quiz-questions/${id}`);
  }

  async uploadLessonFile(chapterId: number, file: File): Promise<TeacherLessonModel> {
    const formData = new FormData();
    formData.append('file', file);
    const errors: string[] = [];
    for (const base of this.getBases()) {
      try {
        return await firstValueFrom(
          this.http
            .post<TeacherLessonModel>(`${base}/api/chapters/${chapterId}/lessons/upload`, formData)
            .pipe(timeout({ first: TeacherApiService.WRITE_MS }))
        );
      } catch (e) {
        errors.push(this.errMsg(e));
      }
    }
    throw new Error(errors[errors.length - 1] ?? 'Upload impossible');
  }

  private async get<T>(path: string): Promise<T> {
    const errors: string[] = [];
    for (const base of this.getBases()) {
      try {
        return await firstValueFrom(
          this.http.get<T>(`${base}${path}`).pipe(timeout({ first: TeacherApiService.GET_MS }))
        );
      } catch (e) {
        errors.push(this.errMsg(e));
      }
    }
    throw new Error(errors[errors.length - 1] ?? 'API indisponible');
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.write('POST', path, body);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    return this.write('PUT', path, body);
  }

  private async delete(path: string): Promise<void> {
    const errors: string[] = [];
    for (const base of this.getBases()) {
      try {
        await firstValueFrom(
          this.http.delete(`${base}${path}`).pipe(timeout({ first: TeacherApiService.WRITE_MS }))
        );
        return;
      } catch (e) {
        errors.push(this.errMsg(e));
      }
    }
    throw new Error(errors[errors.length - 1] ?? 'API indisponible');
  }

  private async write<T>(method: 'POST' | 'PUT', path: string, body: unknown): Promise<T> {
    const errors: string[] = [];
    for (const base of this.getBases()) {
      try {
        const url = `${base}${path}`;
        const req =
          method === 'POST'
            ? this.http.post<T>(url, body, { headers: { 'Content-Type': 'application/json' } })
            : this.http.put<T>(url, body, { headers: { 'Content-Type': 'application/json' } });
        return await firstValueFrom(req.pipe(timeout({ first: TeacherApiService.WRITE_MS })));
      } catch (e) {
        errors.push(this.errMsg(e));
      }
    }
    throw new Error(errors[errors.length - 1] ?? 'API indisponible');
  }

  private errMsg(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { error?: string; message?: string } | string | null;
      if (body && typeof body === 'object') {
        if (body.error) return String(body.error);
        if (body.message) return String(body.message);
      }
      if (typeof body === 'string' && body.length < 250) return body;
      return error.message || `HTTP ${error.status}`;
    }
    return (error as { message?: string })?.message ?? 'Erreur reseau';
  }

  private getBases(): string[] {
    const p = window.location.port;
    if (p === '4200' || p === '4300') return ['', 'http://localhost:8083'];
    const list = ['', 'http://localhost:8083', 'http://localhost:8084'];
    return [...new Set(list)];
  }
}
