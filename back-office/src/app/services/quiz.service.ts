import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  formationId?: number;
  courseId?: number;
  difficulty: string;
  passingScore: number;
  timeLimit?: number;
  createdAt?: Date;
}

export interface Question {
  id?: number;
  quizId: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  order: number;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id?: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizAttempt {
  id?: number;
  quizId: number;
  userId: string;
  score: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizSubmission {
  quizId: number;
  answers: {
    questionId: number;
    selectedOptionId?: number;
    answerText?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/api/quizzes`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ========== QUIZZES ==========
  
  getAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getQuizzesByFormation(formationId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/formation/${formationId}`, { headers: this.getHeaders() });
  }

  getQuizzesByCourse(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/course/${courseId}`, { headers: this.getHeaders() });
  }

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz, { headers: this.getHeaders() });
  }

  updateQuiz(id: number, quiz: Quiz): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.apiUrl}/${id}`, quiz, { headers: this.getHeaders() });
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ========== QUESTIONS ==========
  
  getQuestionsByQuiz(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/${quizId}/questions`, { headers: this.getHeaders() });
  }

  createQuestion(question: Question): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/questions`, question, { headers: this.getHeaders() });
  }

  updateQuestion(id: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/questions/${id}`, question, { headers: this.getHeaders() });
  }

  deleteQuestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/questions/${id}`, { headers: this.getHeaders() });
  }

  // ========== QUIZ ATTEMPTS ==========
  
  startQuiz(quizId: number): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/${quizId}/start`, {}, { headers: this.getHeaders() });
  }

  submitQuiz(submission: QuizSubmission): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/${submission.quizId}/submit`, submission, { headers: this.getHeaders() });
  }

  getMyAttempts(quizId: number): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.apiUrl}/${quizId}/my-attempts`, { headers: this.getHeaders() });
  }

  getAttemptById(attemptId: number): Observable<QuizAttempt> {
    return this.http.get<QuizAttempt>(`${this.apiUrl}/attempts/${attemptId}`, { headers: this.getHeaders() });
  }

  // ========== STATISTICS ==========
  
  getQuizStatistics(quizId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${quizId}/statistics`, { headers: this.getHeaders() });
  }

  getMyQuizProgress(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-progress`, { headers: this.getHeaders() });
  }
}
