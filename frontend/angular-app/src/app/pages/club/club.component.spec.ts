import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ClubComponent } from './club.component';
import { ClubService } from '../../services/club.service';
import { MemberService } from '../../services/member.service';
import { AuthService } from '../../services/auth.service';

describe('ClubComponent', () => {
  let component: ClubComponent;

  const mockClubService = {
    getAll: vi.fn(),
    logoUrl: vi.fn().mockReturnValue('http://localhost/logo.png')
  };

  const mockMemberService = {
    getByUser: vi.fn().mockReturnValue(of([])),
    create: vi.fn()
  };

  const mockAuthService = {
    currentUser$: of(null),
    getCurrentUserValue: vi.fn().mockReturnValue(null),
    isAuthenticated: vi.fn().mockReturnValue(false),
    loadUser: vi.fn(),
    getCurrentUser: vi.fn().mockReturnValue(of(null))
  };

  beforeEach(async () => {
    mockClubService.getAll.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ClubComponent, HttpClientTestingModule],
      providers: [
        { provide: ClubService, useValue: mockClubService },
        { provide: MemberService, useValue: mockMemberService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ClubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Test 1 : composant créé ──
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ── Test 2 : clubs chargés au démarrage ──
  it('should load clubs on init', () => {
    const mockClubs = [
      { idClub: 1, nomClub: 'Blue Wave', type: 'ONLINE', ville: 'Tunis', description: 'Test' }
    ];
    mockClubService.getAll.mockReturnValue(of(mockClubs as any));

    component.loadClubs();

    expect(mockClubService.getAll).toHaveBeenCalled();
    expect(component.clubs.length).toBe(1);
    expect(component.clubs[0].nomClub).toBe('Blue Wave');
  });

  // ── Test 3 : erreur affichée si clubs échoue ──
  it('should set errorMsg when loadClubs fails', () => {
    mockClubService.getAll.mockReturnValue(throwError(() => new Error('Network error')));

    component.loadClubs();

    expect(component.errorMsg).toBeTruthy();
  });

  // ── Test 4 : isJoined retourne false si club non rejoint ──
  it('should return false for isJoined when club not joined', () => {
    component.joinedClubIds.clear();
    expect(component.isJoined(99)).toBe(false);
  });

  // ── Test 5 : isJoined retourne true si club rejoint ──
  it('should return true for isJoined when club is joined', () => {
    component.joinedClubIds.add(1);
    expect(component.isJoined(1)).toBe(true);
  });

  // ── Test 6 : description originale par défaut ──
  it('should return original description when no translation active', () => {
    const club: any = { idClub: 1, description: 'Original description' };
    expect(component.getDescription(club)).toBe('Original description');
  });

  // ── Test 7 : toggle traduction revient à original si déjà actif ──
  it('should toggle back to original when same language clicked twice', () => {
    const club: any = { idClub: 1, description: 'Hello' };
    component.activeLang[1] = 'fr';
    component.translationCache[1] = { fr: 'Bonjour' };

    component.translate(club, 'fr');

    expect(component.activeLang[1]).toBe('original');
  });

  // ── Test 8 : utilise le cache si traduction déjà disponible ──
  it('should use cache when translation already exists', () => {
    const club: any = { idClub: 1, description: 'Hello' };
    component.translationCache[1] = { fr: 'Bonjour' };

    component.translate(club, 'fr');

    expect(component.activeLang[1]).toBe('fr');
    expect(component.getDescription(club)).toBe('Bonjour');
  });
});
