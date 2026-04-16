import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { Challenges } from './challenges';
import { ChallengeService } from '../../services/challenge.service';
import { ChallengeType, ProficiencyLevel, SkillFocus } from '../../models/challenge.model';

const mockChallenges: any[] = [
  {
    id: 1, title: 'Grammar Basics', description: 'Test grammar',
    type: ChallengeType.GRAMMAR, skillFocus: SkillFocus.GRAMMAR,
    level: ProficiencyLevel.B1, category: 'Tenses', points: 100,
    isPublic: true, questions: [], totalAttempts: 10, isExpired: false
  },
  {
    id: 2, title: 'Vocabulary A1', description: 'Learn words',
    type: ChallengeType.VOCABULARY, skillFocus: SkillFocus.VOCABULARY,
    level: ProficiencyLevel.A1, category: 'Words', points: 50,
    isPublic: true, questions: [], totalAttempts: 5, isExpired: false
  },
  {
    id: 3, title: 'Old Weekly', description: 'Expired challenge',
    type: ChallengeType.MIXED, skillFocus: SkillFocus.VOCABULARY,
    level: ProficiencyLevel.A2, category: 'Mixed', points: 75,
    isPublic: true, questions: [], totalAttempts: 2, isExpired: true
  }
];

const mockChallengeService = {
  getAllChallenges:    vi.fn(() => of(mockChallenges)),
  getWeeklyLeaderboard: vi.fn(() => of([])),
  getLevelLabel:      vi.fn(() => 'Intermediate'),
  getLevelColor:      vi.fn(() => 'bg-yellow-100 text-yellow-800'),
  getTypeIcon:        vi.fn(() => '✍️'),
  getSuccessRateColor: vi.fn(() => 'text-green-600'),
  getTypeGradient:    vi.fn(() => 'bg-gradient-to-r from-blue-400 to-blue-600'),
  getTypeBackground:  vi.fn(() => 'bg-blue-50'),
  getSuccessRateBar:  vi.fn(() => 'bg-green-500'),
};

describe('Challenges Component', () => {
  let component: Challenges;
  let fixture: ComponentFixture<Challenges>;

  beforeEach(async () => {
    // Reset mocks before each test
    mockChallengeService.getAllChallenges.mockReturnValue(of(mockChallenges));
    mockChallengeService.getWeeklyLeaderboard.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Challenges, RouterTestingModule],
      providers: [{ provide: ChallengeService, useValue: mockChallengeService }]
    }).compileComponents();

    fixture = TestBed.createComponent(Challenges);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Initialization ─────────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load challenges on init', () => {
      expect(mockChallengeService.getAllChallenges).toHaveBeenCalled();
      expect(component.challenges().length).toBe(3);
    });

    it('should load weekly leaderboard on init', () => {
      expect(mockChallengeService.getWeeklyLeaderboard).toHaveBeenCalled();
    });

    it('should default to challenges tab', () => {
      expect(component.activeTab()).toBe('challenges');
    });

    it('should not be loading after data arrives', () => {
      expect(component.loading()).toBe(false);
    });
  });

  // ── Filtering ──────────────────────────────────────────────────────────────

  describe('filtering', () => {
    it('should show all challenges initially', () => {
      expect(component.filteredChallenges().length).toBe(3);
    });

    it('should filter by level', () => {
      component.onLevelChange('B1');
      expect(component.filteredChallenges().every(c => c.level === 'B1')).toBe(true);
    });

    it('should filter by type', () => {
      component.onTypeChange('GRAMMAR');
      expect(component.filteredChallenges().every(c => c.type === 'GRAMMAR')).toBe(true);
    });

    it('should filter by search term (case-insensitive)', () => {
      component.onSearchChange('grammar');
      expect(component.filteredChallenges().length).toBe(1);
      expect(component.filteredChallenges()[0].title).toBe('Grammar Basics');
    });

    it('should return empty list when search matches nothing', () => {
      component.onSearchChange('xyznotfound');
      expect(component.filteredChallenges().length).toBe(0);
    });

    it('should reset filters correctly', () => {
      component.onLevelChange('C1');
      component.selectedLevel.set('all');
      component.selectedType.set('all');
      component.searchTerm.set('');
      component.applyFilters();
      expect(component.filteredChallenges().length).toBe(3);
    });
  });

  // ── Tab switching ──────────────────────────────────────────────────────────

  describe('tab switching', () => {
    it('should switch to leaderboard tab', () => {
      component.activeTab.set('leaderboard');
      expect(component.activeTab()).toBe('leaderboard');
    });

    it('should switch back to challenges tab', () => {
      component.activeTab.set('leaderboard');
      component.activeTab.set('challenges');
      expect(component.activeTab()).toBe('challenges');
    });
  });

  // ── Helper methods ─────────────────────────────────────────────────────────

  describe('getRankMedal()', () => {
    it('should return 🥇 for rank 1', () => {
      expect(component.getRankMedal(1)).toBe('🥇');
    });
    it('should return 🥈 for rank 2', () => {
      expect(component.getRankMedal(2)).toBe('🥈');
    });
    it('should return 🥉 for rank 3', () => {
      expect(component.getRankMedal(3)).toBe('🥉');
    });
    it('should return #N for rank > 3', () => {
      expect(component.getRankMedal(5)).toBe('#5');
    });
  });

  describe('getPassRateColor()', () => {
    it('should return green for rate >= 70', () => {
      expect(component.getPassRateColor(80)).toContain('green');
    });
    it('should return yellow for rate 40–69', () => {
      expect(component.getPassRateColor(55)).toContain('yellow');
    });
    it('should return red for rate < 40', () => {
      expect(component.getPassRateColor(20)).toContain('red');
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('should set loading to false even when service throws', () => {
      mockChallengeService.getAllChallenges.mockReturnValue(
        throwError(() => new Error('Network error'))
      );
      component.loadChallenges();
      expect(component.loading()).toBe(false);
    });
  });
});
