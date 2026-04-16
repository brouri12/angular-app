import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ChallengeService } from './challenge.service';

describe('ChallengeService', () => {
  let service: ChallengeService;
  let httpMock: HttpTestingController;
  const API = 'http://localhost:8888/challenge-service/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChallengeService]
    });
    service = TestBed.inject(ChallengeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getAllChallenges ────────────────────────────────────────────────────────

  describe('getAllChallenges()', () => {
    it('should GET /challenges and return array', () => {
      const mock = [{ id: 1, title: 'Grammar Test' }];
      service.getAllChallenges().subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].title).toBe('Grammar Test');
      });
      const req = httpMock.expectOne(`${API}/challenges`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  // ── getChallengeById ───────────────────────────────────────────────────────

  describe('getChallengeById()', () => {
    it('should GET /challenges/5', () => {
      const mock = { id: 5, title: 'Vocabulary A1' };
      service.getChallengeById(5).subscribe(data => {
        expect(data.id).toBe(5);
      });
      const req = httpMock.expectOne(`${API}/challenges/5`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  // ── submitChallenge ────────────────────────────────────────────────────────

  describe('submitChallenge()', () => {
    it('should POST /submissions with correct body', () => {
      const request: any = {
        challengeId: 1,
        userId: 42,
        answers: { 1: 'went', 2: 'False' },
        completionTime: 120
      };
      const mockResponse = { id: 100, status: 'PASSED', score: 80 };

      service.submitChallenge(request).subscribe(res => {
        expect(res.id).toBe(100);
      });

      const req = httpMock.expectOne(`${API}/submissions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.challengeId).toBe(1);
      req.flush(mockResponse);
    });
  });

  // ── getSubmissionById ──────────────────────────────────────────────────────

  describe('getSubmissionById()', () => {
    it('should GET /submissions/100', () => {
      const mock = { id: 100, score: 60, passed: false };
      service.getSubmissionById(100).subscribe(data => {
        expect(data.id).toBe(100);
      });
      const req = httpMock.expectOne(`${API}/submissions/100`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  // ── getUserSubmissions ─────────────────────────────────────────────────────

  describe('getUserSubmissions()', () => {
    it('should GET /submissions/user/42', () => {
      const mock = [{ id: 1 }, { id: 2 }];
      service.getUserSubmissions(42).subscribe(data => {
        expect(data.length).toBe(2);
      });
      const req = httpMock.expectOne(`${API}/submissions/user/42`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  // ── getGlobalStats ─────────────────────────────────────────────────────────

  describe('getGlobalStats()', () => {
    it('should GET /stats/global', () => {
      const mock = { totalChallenges: 10, totalSubmissions: 50, globalPassRate: 72.5 };
      service.getGlobalStats().subscribe(data => {
        expect(data.totalChallenges).toBe(10);
        expect(data.globalPassRate).toBe(72.5);
      });
      const req = httpMock.expectOne(`${API}/stats/global`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  // ── getLeaderboard ─────────────────────────────────────────────────────────

  describe('getLeaderboard()', () => {
    it('should GET /stats/leaderboard with default limit 10', () => {
      const mock = [{ userId: 1, rank: 1, totalScore: 500 }];
      service.getLeaderboard().subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].rank).toBe(1);
      });
      const req = httpMock.expectOne(`${API}/stats/leaderboard?limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });

    it('should GET /stats/leaderboard with custom limit', () => {
      service.getLeaderboard(5).subscribe();
      const req = httpMock.expectOne(`${API}/stats/leaderboard?limit=5`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  // ── predictSuccess ─────────────────────────────────────────────────────────

  describe('predictSuccess()', () => {
    it('should GET /stats/predict with userId and challengeId', () => {
      const mock = {
        successProbability: 78.5,
        confidence: 'HIGH',
        advice: 'Go for it!'
      };
      service.predictSuccess(1, 5).subscribe(data => {
        expect(data.successProbability).toBe(78.5);
        expect(data.confidence).toBe('HIGH');
      });
      const req = httpMock.expectOne(`${API}/stats/predict?userId=1&challengeId=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });
  });

  // ── getWeeklyLeaderboard ───────────────────────────────────────────────────

  describe('getWeeklyLeaderboard()', () => {
    it('should GET /stats/weekly-leaderboard without weekStart', () => {
      const mock = [{ rank: 1, userId: 42, totalScore: 300 }];
      service.getWeeklyLeaderboard().subscribe(data => {
        expect(data.length).toBe(1);
      });
      const req = httpMock.expectOne(`${API}/stats/weekly-leaderboard`);
      expect(req.request.method).toBe('GET');
      req.flush(mock);
    });

    it('should GET /stats/weekly-leaderboard with weekStart param', () => {
      service.getWeeklyLeaderboard('2026-04-14').subscribe();
      const req = httpMock.expectOne(
        `${API}/stats/weekly-leaderboard?weekStart=2026-04-14`
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  // ── Helper methods ─────────────────────────────────────────────────────────

  describe('getLevelLabel()', () => {
    it('should return correct label for each level', () => {
      expect(service.getLevelLabel('A1' as any)).toBe('Beginner');
      expect(service.getLevelLabel('B1' as any)).toBe('Intermediate');
      expect(service.getLevelLabel('C1' as any)).toBe('Advanced');
    });
  });

  describe('getLevelColor()', () => {
    it('should return a CSS class string for A1', () => {
      expect(service.getLevelColor('A1' as any)).toContain('green');
    });
    it('should return a CSS class string for C1', () => {
      expect(service.getLevelColor('C1' as any)).toContain('red');
    });
  });

  describe('getTypeIcon()', () => {
    it('should return emoji for VOCABULARY', () => {
      expect(service.getTypeIcon('VOCABULARY' as any)).toBe('📚');
    });
    it('should return emoji for GRAMMAR', () => {
      expect(service.getTypeIcon('GRAMMAR' as any)).toBe('✍️');
    });
    it('should return emoji for MIXED', () => {
      expect(service.getTypeIcon('MIXED' as any)).toBe('🎯');
    });
  });
});
