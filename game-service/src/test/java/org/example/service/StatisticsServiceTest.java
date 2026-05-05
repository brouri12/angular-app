package org.example.service;

import org.example.dto.GlobalStatsDTO;
import org.example.dto.UserStatsDTO;
import org.example.entity.PlayerSession;
import org.example.entity.Submission;
import org.example.repository.GameRepository;
import org.example.repository.PlayerSessionRepository;
import org.example.repository.SubmissionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Unit tests for StatisticsService.
 *
 * Covers:
 * - getUserStats: pass rate, accuracy, streak from session
 * - getUserStats: no submissions → all zeros
 * - getUserStats: no session → defaults
 * - getGlobalStats: counts and pass rate
 * - getLeaderboard: sorted by XP descending
 */
@ExtendWith(MockitoExtension.class)
class StatisticsServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private PlayerSessionRepository sessionRepository;
    @Mock private GameRepository gameRepository;

    @InjectMocks
    private StatisticsService service;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Submission makeSubmission(String status, int correct, int total, int score) {
        Submission s = new Submission();
        s.setStatus(status);
        s.setCorrectAnswers(correct);
        s.setTotalQuestions(total);
        s.setScore(score);
        return s;
    }

    private PlayerSession makeSession(String userId, int xp, int level, int streak, int bestStreak, int won) {
        return PlayerSession.builder()
                .userId(userId)
                .totalXP(xp)
                .level(level)
                .progressBar(xp % 100)
                .winStreak(streak)
                .bestStreak(bestStreak)
                .gamesWon(won)
                .build();
    }

    // ─── getUserStats ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUserStats — calculates passRate and accuracy correctly")
    void getUserStats_calculatesCorrectly() {
        Submission passed = makeSubmission("PASSED", 8, 10, 80);
        Submission failed = makeSubmission("FAILED", 3, 10, 30);
        PlayerSession session = makeSession("user-1", 110, 2, 3, 5, 1);

        when(submissionRepository.findByUserIdOrderBySubmittedAtDesc("user-1"))
                .thenReturn(List.of(passed, failed));
        when(sessionRepository.findByUserId("user-1")).thenReturn(Optional.of(session));

        UserStatsDTO result = service.getUserStats("user-1");

        assertThat(result.getTotalGamesPlayed()).isEqualTo(2);
        assertThat(result.getTotalGamesPassed()).isEqualTo(1);
        assertThat(result.getTotalGamesFailed()).isEqualTo(1);
        assertThat(result.getPassRate()).isEqualTo(50.0);
        // accuracy = avg of (80%, 30%) = 55%
        assertThat(result.getOverallAccuracy()).isEqualTo(55.0);
        assertThat(result.getCurrentStreak()).isEqualTo(3);
        assertThat(result.getBestStreak()).isEqualTo(5);
        assertThat(result.getLevel()).isEqualTo(2);
    }

    @Test
    @DisplayName("getUserStats — returns zeros when no submissions")
    void getUserStats_noSubmissions_returnsZeros() {
        when(submissionRepository.findByUserIdOrderBySubmittedAtDesc("new-user"))
                .thenReturn(List.of());
        when(sessionRepository.findByUserId("new-user")).thenReturn(Optional.empty());

        UserStatsDTO result = service.getUserStats("new-user");

        assertThat(result.getTotalGamesPlayed()).isEqualTo(0);
        assertThat(result.getPassRate()).isEqualTo(0.0);
        assertThat(result.getOverallAccuracy()).isEqualTo(0.0);
        assertThat(result.getLevel()).isEqualTo(1);
        assertThat(result.getTotalXP()).isEqualTo(0);
    }

    @Test
    @DisplayName("getUserStats — uses session data for level and XP")
    void getUserStats_usesSessionData() {
        PlayerSession session = makeSession("user-1", 250, 3, 2, 7, 5);
        when(submissionRepository.findByUserIdOrderBySubmittedAtDesc("user-1"))
                .thenReturn(List.of());
        when(sessionRepository.findByUserId("user-1")).thenReturn(Optional.of(session));

        UserStatsDTO result = service.getUserStats("user-1");

        assertThat(result.getLevel()).isEqualTo(3);
        assertThat(result.getTotalXP()).isEqualTo(250);
        assertThat(result.getProgressBar()).isEqualTo(50); // 250 % 100
    }

    // ─── getGlobalStats ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getGlobalStats — counts games, submissions, players correctly")
    void getGlobalStats_countsCorrectly() {
        Submission s1 = makeSubmission("PASSED", 8, 10, 80);
        Submission s2 = makeSubmission("FAILED", 2, 10, 20);
        Submission s3 = makeSubmission("PASSED", 9, 10, 90);

        when(gameRepository.count()).thenReturn(5L);
        when(submissionRepository.count()).thenReturn(3L);
        when(sessionRepository.count()).thenReturn(2L);
        when(submissionRepository.findAll()).thenReturn(List.of(s1, s2, s3));
        when(sessionRepository.findAll()).thenReturn(List.of());

        GlobalStatsDTO result = service.getGlobalStats();

        assertThat(result.getTotalGames()).isEqualTo(5);
        assertThat(result.getTotalSubmissions()).isEqualTo(3);
        assertThat(result.getTotalPlayers()).isEqualTo(2);
        // 2/3 passed = 66.7%
        assertThat(result.getGlobalPassRate()).isEqualTo(66.7);
        // avg score = (80+20+90)/3 = 63.3
        assertThat(result.getGlobalAverageScore()).isEqualTo(63.3);
    }

    @Test
    @DisplayName("getGlobalStats — passRate is 0 when no submissions")
    void getGlobalStats_noSubmissions_passRateZero() {
        when(gameRepository.count()).thenReturn(0L);
        when(submissionRepository.count()).thenReturn(0L);
        when(sessionRepository.count()).thenReturn(0L);
        when(submissionRepository.findAll()).thenReturn(List.of());
        when(sessionRepository.findAll()).thenReturn(List.of());

        GlobalStatsDTO result = service.getGlobalStats();

        assertThat(result.getGlobalPassRate()).isEqualTo(0.0);
        assertThat(result.getGlobalAverageScore()).isEqualTo(0.0);
    }

    // ─── getLeaderboard ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getLeaderboard — sorted by totalXP descending")
    void getLeaderboard_sortedByXP() {
        PlayerSession s1 = makeSession("user-a", 50, 1, 0, 0, 0);
        PlayerSession s2 = makeSession("user-b", 200, 3, 2, 3, 5);
        PlayerSession s3 = makeSession("user-c", 100, 2, 1, 1, 2);

        when(sessionRepository.findAll()).thenReturn(List.of(s1, s2, s3));
        when(submissionRepository.findByUserIdOrderBySubmittedAtDesc(any()))
                .thenReturn(List.of());

        var result = service.getLeaderboard(10);

        assertThat(result).hasSize(3);
        assertThat(result.get(0).getUserId()).isEqualTo("user-b"); // highest XP
        assertThat(result.get(1).getUserId()).isEqualTo("user-c");
        assertThat(result.get(2).getUserId()).isEqualTo("user-a");
        assertThat(result.get(0).getRank()).isEqualTo(1);
        assertThat(result.get(1).getRank()).isEqualTo(2);
    }

    @Test
    @DisplayName("getLeaderboard — respects limit parameter")
    void getLeaderboard_respectsLimit() {
        PlayerSession s1 = makeSession("u1", 300, 4, 0, 0, 0);
        PlayerSession s2 = makeSession("u2", 200, 3, 0, 0, 0);
        PlayerSession s3 = makeSession("u3", 100, 2, 0, 0, 0);

        when(sessionRepository.findAll()).thenReturn(List.of(s1, s2, s3));
        when(submissionRepository.findByUserIdOrderBySubmittedAtDesc(any()))
                .thenReturn(List.of());

        var result = service.getLeaderboard(2);

        assertThat(result).hasSize(2);
    }
}
