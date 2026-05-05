package org.example.service;

import org.example.entity.PlayerSession;
import org.example.repository.PlayerSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PlayerSessionService.
 *
 * Covers:
 * - XP awarding and level-up calculation
 * - Win streak increment and reset
 * - Best streak tracking
 * - Session creation when none exists
 * - Session reset
 */
@ExtendWith(MockitoExtension.class)
class PlayerSessionServiceTest {

    @Mock
    private PlayerSessionRepository repo;

    @InjectMocks
    private PlayerSessionService service;

    private PlayerSession existingSession;

    @BeforeEach
    void setUp() {
        existingSession = PlayerSession.builder()
                .userId("user-1")
                .totalXP(0)
                .level(1)
                .progressBar(0)
                .gamesWon(0)
                .gamesLost(0)
                .totalGamesPlayed(0)
                .winStreak(0)
                .bestStreak(0)
                .build();
    }

    // ─── getOrCreate ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getOrCreate — returns existing session when found")
    void getOrCreate_existingSession_returnsIt() {
        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));

        PlayerSession result = service.getOrCreate("user-1");

        assertThat(result.getUserId()).isEqualTo("user-1");
        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("getOrCreate — creates and saves new session when not found")
    void getOrCreate_noSession_createsNew() {
        when(repo.findByUserId("new-user")).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.getOrCreate("new-user");

        assertThat(result.getUserId()).isEqualTo("new-user");
        verify(repo, times(1)).save(any(PlayerSession.class));
    }

    // ─── awardXP — XP and level calculation ──────────────────────────────────

    @Test
    @DisplayName("awardXP — XP below 100 stays at level 1, progressBar = XP")
    void awardXP_below100_staysLevel1() {
        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 50, true);

        assertThat(result.getTotalXP()).isEqualTo(50);
        assertThat(result.getLevel()).isEqualTo(1);
        assertThat(result.getProgressBar()).isEqualTo(50);
    }

    @Test
    @DisplayName("awardXP — exactly 100 XP triggers level-up to level 2, progressBar = 0")
    void awardXP_exactly100_levelsUp() {
        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 100, true);

        assertThat(result.getTotalXP()).isEqualTo(100);
        assertThat(result.getLevel()).isEqualTo(2);
        assertThat(result.getProgressBar()).isEqualTo(0);
    }

    @Test
    @DisplayName("awardXP — 150 XP total = level 2, progressBar = 50")
    void awardXP_150total_level2Progress50() {
        existingSession.setTotalXP(100);
        existingSession.setLevel(2);
        existingSession.setProgressBar(0);

        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 50, true);

        assertThat(result.getTotalXP()).isEqualTo(150);
        assertThat(result.getLevel()).isEqualTo(2);
        assertThat(result.getProgressBar()).isEqualTo(50);
    }

    @Test
    @DisplayName("awardXP — 250 XP total = level 3, progressBar = 50")
    void awardXP_250total_level3Progress50() {
        existingSession.setTotalXP(200);
        existingSession.setLevel(3);
        existingSession.setProgressBar(0);

        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 50, false);

        assertThat(result.getTotalXP()).isEqualTo(250);
        assertThat(result.getLevel()).isEqualTo(3);
        assertThat(result.getProgressBar()).isEqualTo(50);
    }

    // ─── awardXP — win streak logic ───────────────────────────────────────────

    @Test
    @DisplayName("awardXP — passed=true increments winStreak and gamesWon")
    void awardXP_passed_incrementsStreak() {
        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 10, true);

        assertThat(result.getWinStreak()).isEqualTo(1);
        assertThat(result.getGamesWon()).isEqualTo(1);
        assertThat(result.getGamesLost()).isEqualTo(0);
    }

    @Test
    @DisplayName("awardXP — passed=false resets winStreak and increments gamesLost")
    void awardXP_failed_resetsStreak() {
        existingSession.setWinStreak(5);
        existingSession.setBestStreak(5);

        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 0, false);

        assertThat(result.getWinStreak()).isEqualTo(0);
        assertThat(result.getGamesLost()).isEqualTo(1);
        assertThat(result.getBestStreak()).isEqualTo(5); // best streak preserved
    }

    @Test
    @DisplayName("awardXP — bestStreak updates when winStreak exceeds it")
    void awardXP_newBestStreak_updates() {
        existingSession.setWinStreak(4);
        existingSession.setBestStreak(4);

        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 10, true);

        assertThat(result.getWinStreak()).isEqualTo(5);
        assertThat(result.getBestStreak()).isEqualTo(5);
    }

    @Test
    @DisplayName("awardXP — totalGamesPlayed increments on every call")
    void awardXP_alwaysIncrementsTotalGamesPlayed() {
        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.awardXP("user-1", 10, false);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(1);
    }

    // ─── resetSession ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("resetSession — resets all stats to zero / level 1")
    void resetSession_resetsAllFields() {
        existingSession.setTotalXP(500);
        existingSession.setLevel(6);
        existingSession.setProgressBar(50);
        existingSession.setGamesWon(10);
        existingSession.setGamesLost(3);
        existingSession.setTotalGamesPlayed(13);
        existingSession.setWinStreak(4);

        when(repo.findByUserId("user-1")).thenReturn(Optional.of(existingSession));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PlayerSession result = service.resetSession("user-1");

        assertThat(result.getTotalXP()).isEqualTo(0);
        assertThat(result.getLevel()).isEqualTo(1);
        assertThat(result.getProgressBar()).isEqualTo(0);
        assertThat(result.getGamesWon()).isEqualTo(0);
        assertThat(result.getGamesLost()).isEqualTo(0);
        assertThat(result.getTotalGamesPlayed()).isEqualTo(0);
        assertThat(result.getWinStreak()).isEqualTo(0);
        verify(repo, times(1)).save(existingSession);
    }
}
