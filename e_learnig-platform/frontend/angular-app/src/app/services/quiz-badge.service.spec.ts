import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizBadgeService } from './quiz-badge.service';
import { API_BASE_URL, API_ENDPOINTS } from '../core/api.config';

describe('QuizBadgeService', () => {
  let service: QuizBadgeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), QuizBadgeService],
    });
    service = TestBed.inject(QuizBadgeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getQuestionsForCourse should GET /api/questions/course/:id', () => {
    const courseId = 42;
    const mock = [{ id: 1, courseId: 42, questionText: 'Q1?' }];
    service.getQuestionsForCourse(courseId).subscribe((data) => {
      expect(data).toEqual(mock);
    });
    const req = httpMock.expectOne(
      `${API_BASE_URL}${API_ENDPOINTS.questions}/course/${courseId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getBadgesForStudent should GET /api/badges/student/:id', () => {
    const studentId = 7;
    const mock = [{ id: 10, studentId: 7, badgeName: 'Star' }];
    service.getBadgesForStudent(studentId).subscribe((data) => {
      expect(data).toEqual(mock);
    });
    const req = httpMock.expectOne(
      `${API_BASE_URL}${API_ENDPOINTS.badges}/student/${studentId}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getAllBadges should GET /api/badges', () => {
    const mock = [{ id: 11, studentId: 8, badgeName: 'Champion' }];
    service.getAllBadges().subscribe((data) => {
      expect(data).toEqual(mock);
    });
    const req = httpMock.expectOne(`${API_BASE_URL}${API_ENDPOINTS.badges}`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
