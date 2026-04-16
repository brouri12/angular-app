import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ChallengeDetail } from './challenge-detail';
import { ChallengeService } from '../../services/challenge.service';
import { AuthService } from '../../services/auth.service';
import { ChallengeType, ProficiencyLevel, QuestionType, SkillFocus } from '../../models/challenge.model';

const mockChallenge: any = {
  id: 1,
  title: 'Grammar Test',
  description: 'Test your grammar',
  type: ChallengeType.GRAMMAR,
  skillFocus: SkillFocus.GRAMMAR,
  level: ProficiencyLevel.B1,
  category: 'Tenses',
  points: 100,
  timeLimit: null,
  isPublic: true,
  isExpired: false,
  questions: [
    { id: 1, questionText: 'Q1?', type: QuestionType.MULTIPLE_CHOICE,
      options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', points: 20, orderIndex: 0 },
    { id: 2, questionText: 'Q2?', type: QuestionType.TRUE_FALSE,
      options: ['True', 'False'], correctAnswer: 'True', points: 20, orderIndex: 1 },
    { id: 3, questionText: 'Q3?', type: QuestionType.FILL_BLANK,
      correctAnswer: 'went', points: 20, orderIndex: 2 }
  ]
};

const mockPrediction = {
  successProbability: 75.0,
  confidence: 'HIGH',
  advice: 'Go for it!',
  userOverallPassRate: 80,
  userTypePassRate: 75,
  userLevelPassRate: 70,
  challengeGlobalPassRate: 65,
  currentStreak: 3,
  totalSubmissions: 10
};

const mockChallengeService = {
  getChallengeById: vi.fn(() => of(mockChallenge)),
  submitChallenge:  vi.fn(),
  predictSuccess:   vi.fn(() => of(mockPrediction)),
  getLevelLabel:    vi.fn(() => 'Intermediate'),
  getLevelColor:    vi.fn(() => 'bg-yellow-100 text-yellow-800'),
  getTypeIcon:      vi.fn(() => '✍️'),
};

const mockAuthService = {
  currentUser$: of({ id_user: 42, id: 42, email: 'test@test.com' })
};

describe('ChallengeDetail Component', () => {
  let component: ChallengeDetail;
  let fixture: ComponentFixture<ChallengeDetail>;

  beforeEach(async () => {
    mockChallengeService.getChallengeById.mockReturnValue(of(mockChallenge));
    mockChallengeService.predictSuccess.mockReturnValue(of(mockPrediction));

    await TestBed.configureTestingModule({
      imports: [ChallengeDetail, RouterTestingModule],
      providers: [
        { provide: ChallengeService, useValue: mockChallengeService },
        { provide: AuthService,      useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChallengeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (component.timerInterval) clearInterval(component.timerInterval);
  });

  // ── Initialization ─────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load challenge on init', () => {
      expect(mockChallengeService.getChallengeById).toHaveBeenCalledWith(1);
      expect(component.challenge()).toBeTruthy();
      expect(component.challenge()!.title).toBe('Grammar Test');
    });

    it('should load prediction on init', () => {
      expect(mockChallengeService.predictSuccess).toHaveBeenCalledWith(42, 1);
      expect(component.prediction()).toBeTruthy();
      expect(component.prediction()!.successProbability).toBe(75.0);
    });

    it('should not be loading after data arrives', () => {
      expect(component.loading()).toBe(false);
    });

    it('should start at question index 0', () => {
      expect(component.currentQuestionIndex()).toBe(0);
    });
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  describe('question navigation', () => {
    it('should go to next question', () => {
      component.nextQuestion();
      expect(component.currentQuestionIndex()).toBe(1);
    });

    it('should go to previous question', () => {
      component.currentQuestionIndex.set(2);
      component.previousQuestion();
      expect(component.currentQuestionIndex()).toBe(1);
    });

    it('should not go below index 0', () => {
      component.previousQuestion();
      expect(component.currentQuestionIndex()).toBe(0);
    });

    it('should not go beyond last question', () => {
      component.currentQuestionIndex.set(2);
      component.nextQuestion();
      expect(component.currentQuestionIndex()).toBe(2);
    });

    it('should jump to specific question', () => {
      component.goToQuestion(2);
      expect(component.currentQuestionIndex()).toBe(2);
    });
  });

  // ── Answers ────────────────────────────────────────────────────────────────

  describe('answer management', () => {
    it('should record an answer', () => {
      component.setAnswer(1, 'A');
      expect(component.answers()[1]).toBe('A');
    });

    it('should update an existing answer', () => {
      component.setAnswer(1, 'A');
      component.setAnswer(1, 'B');
      expect(component.answers()[1]).toBe('B');
    });

    it('should track multiple answers independently', () => {
      component.setAnswer(1, 'A');
      component.setAnswer(2, 'True');
      expect(component.answers()[1]).toBe('A');
      expect(component.answers()[2]).toBe('True');
    });
  });

  // ── canSubmit ──────────────────────────────────────────────────────────────

  describe('canSubmit()', () => {
    it('should return false when not all questions answered', () => {
      component.setAnswer(1, 'A');
      expect(component.canSubmit()).toBe(false);
    });

    it('should return true when all 3 questions answered', () => {
      component.setAnswer(1, 'A');
      component.setAnswer(2, 'True');
      component.setAnswer(3, 'went');
      expect(component.canSubmit()).toBe(true);
    });
  });

  // ── Progress ───────────────────────────────────────────────────────────────

  describe('progress computed', () => {
    it('should be 0% initially', () => {
      expect(component.progress()).toBe(0);
    });

    it('should be ~33% after 1 of 3 answered', () => {
      component.setAnswer(1, 'A');
      expect(component.progress()).toBeCloseTo(33.33, 0);
    });

    it('should be 100% when all answered', () => {
      component.setAnswer(1, 'A');
      component.setAnswer(2, 'True');
      component.setAnswer(3, 'went');
      expect(component.progress()).toBe(100);
    });
  });

  // ── Prediction helpers ─────────────────────────────────────────────────────

  describe('prediction helpers', () => {
    it('getPredictionColor() should return green for probability >= 70', () => {
      expect(component.getPredictionColor()).toContain('green');
    });

    it('getPredictionIcon() should return 🟢 for probability >= 70', () => {
      expect(component.getPredictionIcon()).toBe('🟢');
    });

    it('getPredictionBg() should contain green for high probability', () => {
      expect(component.getPredictionBg()).toContain('green');
    });
  });

  // ── formatTime ─────────────────────────────────────────────────────────────

  describe('formatTime()', () => {
    it('should format 0 seconds as 0:00', () => {
      expect(component.formatTime(0)).toBe('0:00');
    });
    it('should format 90 seconds as 1:30', () => {
      expect(component.formatTime(90)).toBe('1:30');
    });
    it('should format 600 seconds as 10:00', () => {
      expect(component.formatTime(600)).toBe('10:00');
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('should set loading to false when challenge load fails', () => {
      mockChallengeService.getChallengeById.mockReturnValue(
        throwError(() => new Error('Not found'))
      );
      component.loadChallenge(999);
      expect(component.loading()).toBe(false);
    });

    it('should not throw when prediction fails', () => {
      mockChallengeService.predictSuccess.mockReturnValue(
        throwError(() => new Error('Service unavailable'))
      );
      expect(() => component.loadPrediction(1)).not.toThrow();
    });
  });
});
