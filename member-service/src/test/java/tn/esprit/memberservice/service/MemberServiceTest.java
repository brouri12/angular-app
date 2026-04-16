package tn.esprit.memberservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.memberservice.entity.*;
import tn.esprit.memberservice.repository.MemberRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    MemberRepository repo;

    @Mock
    EmailService emailService;

    @InjectMocks
    MemberService memberService;

    private Member existingMember;

    @BeforeEach
    void setUp() {
        existingMember = new Member();
        existingMember.setIdMember(1L);
        existingMember.setIdUser(10L);
        existingMember.setIdClub(1L);
        existingMember.setNom("Bouazizi");
        existingMember.setPrenom("Mahdi");
        existingMember.setEmail("mahdi@test.com");
        existingMember.setTelephone("12345678");
        existingMember.setNiveauAnglais(NiveauAnglais.B2);
        existingMember.setRole(MemberRole.RECRUE);
        existingMember.setScore(0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Règle président unique par club
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldThrowWhenClubAlreadyHasPresident() {
        // given : le club 1 a déjà un président
        when(repo.findById(1L)).thenReturn(Optional.of(existingMember));
        when(repo.existsByIdClubAndRole(1L, MemberRole.PRESIDENT)).thenReturn(true);

        // when + then : doit lancer CONFLICT
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> memberService.updateRole(1L, MemberRole.PRESIDENT));

        assertEquals(409, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("président"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Un user ne peut être président que dans un seul club
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldThrowWhenUserAlreadyPresidentInAnotherClub() {
        // given : le club n'a pas de président, mais l'user est déjà président ailleurs
        when(repo.findById(1L)).thenReturn(Optional.of(existingMember));
        when(repo.existsByIdClubAndRole(1L, MemberRole.PRESIDENT)).thenReturn(false);
        when(repo.existsByIdUserAndRole(10L, MemberRole.PRESIDENT)).thenReturn(true);

        // when + then
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> memberService.updateRole(1L, MemberRole.PRESIDENT));

        assertEquals(409, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("déjà président"));
    }

    @Test
    void shouldAssignPresidentWhenNoConflict() {
        // given : pas de président dans le club, user pas encore président
        when(repo.findById(1L)).thenReturn(Optional.of(existingMember));
        when(repo.existsByIdClubAndRole(1L, MemberRole.PRESIDENT)).thenReturn(false);
        when(repo.existsByIdUserAndRole(10L, MemberRole.PRESIDENT)).thenReturn(false);
        when(repo.save(any())).thenReturn(existingMember);

        // when
        Member result = memberService.updateRole(1L, MemberRole.PRESIDENT);

        // then : rôle mis à jour
        assertEquals(MemberRole.PRESIDENT, existingMember.getRole());
        verify(repo, times(1)).save(existingMember);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Score ne descend pas sous 0
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void scoreShouldNotGoBelowZero() {
        existingMember.setScore(5);
        when(repo.findByIdUserAndIdClub(10L, 1L)).thenReturn(Optional.of(existingMember));
        when(repo.save(any())).thenReturn(existingMember);

        memberService.addScore(10L, 1L, -100);

        assertEquals(0, existingMember.getScore());
    }

    @Test
    void scoreShouldIncreaseCorrectly() {
        existingMember.setScore(50);
        when(repo.findByIdUserAndIdClub(10L, 1L)).thenReturn(Optional.of(existingMember));
        when(repo.save(any())).thenReturn(existingMember);

        memberService.addScore(10L, 1L, 30);

        assertEquals(80, existingMember.getScore());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Badge level calculé selon le score
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldComputeGoldLevelWhenScoreAbove100() {
        existingMember.setScore(90);
        when(repo.findByIdUserAndIdClub(10L, 1L)).thenReturn(Optional.of(existingMember));
        when(repo.save(any())).thenReturn(existingMember);

        memberService.addScore(10L, 1L, 20); // score → 110

        assertEquals(BadgeLevel.GOLD, existingMember.getBadgeLevel());
    }

    @Test
    void shouldComputePremiumLevelWhenScoreAbove200() {
        existingMember.setScore(190);
        when(repo.findByIdUserAndIdClub(10L, 1L)).thenReturn(Optional.of(existingMember));
        when(repo.save(any())).thenReturn(existingMember);

        memberService.addScore(10L, 1L, 20); // score → 210

        assertEquals(BadgeLevel.PREMIUM, existingMember.getBadgeLevel());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AA1 : Logique métier — Création membre avec validation
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void shouldThrowWhenMemberAlreadyExistsInClub() {
        when(repo.existsByIdUserAndIdClub(10L, 1L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> memberService.create(existingMember));

        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    void shouldCreateMemberWithRecrueRoleByDefault() {
        when(repo.existsByIdUserAndIdClub(10L, 1L)).thenReturn(false);
        when(repo.save(any())).thenReturn(existingMember);

        Member result = memberService.create(existingMember);

        assertEquals(MemberRole.RECRUE, existingMember.getRole());
        verify(repo, times(1)).save(existingMember);
    }
}
