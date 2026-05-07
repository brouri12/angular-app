import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Formation {
  id?: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  imageUrl?: string;
  teacherId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Course {
  id?: number;
  formationId: number;
  title: string;
  description: string;
  order: number;
  duration: number;
}

export interface Lesson {
  id?: number;
  courseId: number;
  title: string;
  content: string;
  videoUrl?: string;
  order: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/api/formations`;
  private coursesUrl = `${environment.apiUrl}/api/courses`;
  private lessonsUrl = `${environment.apiUrl}/api/lessons`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // ========== FORMATIONS ==========
  
  getAllFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getFormationById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createFormation(formation: Formation): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation, { headers: this.getHeaders() });
  }

  updateFormation(id: number, formation: Formation): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation, { headers: this.getHeaders() });
  }

  deleteFormation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getFormationsByCategory(category: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/category/${category}`, { headers: this.getHeaders() });
  }

  getFormationsByTeacher(teacherId: string): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/teacher/${teacherId}`, { headers: this.getHeaders() });
  }

  // ========== COURSES ==========
  
  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.coursesUrl, { headers: this.getHeaders() });
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.coursesUrl}/${id}`, { headers: this.getHeaders() });
  }

  getCoursesByFormation(formationId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.coursesUrl}/formation/${formationId}`, { headers: this.getHeaders() });
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.coursesUrl, course, { headers: this.getHeaders() });
  }

  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.coursesUrl}/${id}`, course, { headers: this.getHeaders() });
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.coursesUrl}/${id}`, { headers: this.getHeaders() });
  }

  // ========== LESSONS ==========
  
  getAllLessons(): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(this.lessonsUrl, { headers: this.getHeaders() });
  }

  getLessonById(id: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.lessonsUrl}/${id}`, { headers: this.getHeaders() });
  }

  getLessonsByCourse(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.lessonsUrl}/course/${courseId}`, { headers: this.getHeaders() });
  }

  createLesson(lesson: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(this.lessonsUrl, lesson, { headers: this.getHeaders() });
  }

  updateLesson(id: number, lesson: Lesson): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.lessonsUrl}/${id}`, lesson, { headers: this.getHeaders() });
  }

  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.lessonsUrl}/${id}`, { headers: this.getHeaders() });
  }
}
