package tn.esprit.challenge.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.challenge.dto.*;
import tn.esprit.challenge.entity.WeeklyLeaderboard;
import tn.esprit.challenge.repository.WeeklyLeaderboardRepository;
import tn.esprit.challenge.service.PredictionService;
import tn.esprit.challenge.service.StatisticsService;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller exposing all calculation / statistics endpoints
 * for the Challenge microservice.
 *
 * Base path: /api/stats
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatisticsController {

    private final StatisticsService          statisticsService;
    private final PredictionService          predictionService;
    private final WeeklyLeaderboardRepository weeklyLeaderboardRepository;

    // ── User statistics ────────────────────────────────────────────────────────

    /**
     * GET /api/stats/users/{userId}
     * Full statistics for a single user:
     *   - total score, average score
     *   - pass/fail/partial counts
     *   - overall accuracy
     *   - average & fastest completion time
     *   - current & best streak
     *   - score breakdown by level and by challenge type
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserStatsDTO> getUserStats(@PathVariable Long userId) {
        log.info("GET /api/stats/users/{}", userId);
        return ResponseEntity.ok(statisticsService.getUserStats(userId));
    }

    // ── Challenge statistics ───────────────────────────────────────────────────

    /**
     * GET /api/stats/challenges/{challengeId}
     * Full statistics for a single challenge:
     *   - attempt / pass / fail / partial counts
     *   - pass rate, average score, highest/lowest score
     *   - average accuracy, average & fastest completion time
     *   - per-question difficulty analysis (EASY / MEDIUM / HARD / VERY_HARD)
     */
    @GetMapping("/challenges/{challengeId}")
    public ResponseEntity<ChallengeStatsDTO> getChallengeStats(@PathVariable Long challengeId) {
        log.info("GET /api/stats/challenges/{}", challengeId);
        return ResponseEntity.ok(statisticsService.getChallengeStats(challengeId));
    }

    // ── Global / platform statistics ──────────────────────────────────────────

    /**
     * GET /api/stats/global
     * Platform-wide aggregated statistics:
     *   - total challenges, submissions, users, passed submissions
     *   - global pass rate, average score, average accuracy
     *   - top users leaderboard
     *   - most attempted challenges
     *   - hardest challenges (lowest pass rate)
     *   - submission distribution by level and by type
     */
    @GetMapping("/global")
    public ResponseEntity<GlobalStatsDTO> getGlobalStats() {
        log.info("GET /api/stats/global");
        return ResponseEntity.ok(statisticsService.getGlobalStats());
    }

    // ── Leaderboard ────────────────────────────────────────────────────────────

    /**
     * GET /api/stats/leaderboard?limit=10
     * Top N users ranked by total score (passed challenges only).
     * Each entry includes: rank, userId, totalScore, challengesPassed,
     * passRate, averageAccuracy.
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserRankDTO>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/stats/leaderboard?limit={}", limit);
        return ResponseEntity.ok(statisticsService.getLeaderboard(limit));
    }

    // ── Prediction ─────────────────────────────────────────────────────────────

    /**
     * GET /api/stats/predict?userId=1&challengeId=5
     * Predict the probability that a user will pass a specific challenge.
     * Returns a PredictionDTO with probability (0–100), confidence level,
     * factor breakdown, and personalised advice.
     */
    @GetMapping("/predict")
    public ResponseEntity<PredictionDTO> predictSuccess(
            @RequestParam Long userId,
            @RequestParam Long challengeId) {
        log.info("GET /api/stats/predict?userId={}&challengeId={}", userId, challengeId);
        return ResponseEntity.ok(predictionService.predict(userId, challengeId));
    }

    // ── Weekly leaderboard history ─────────────────────────────────────────────

    /**
     * GET /api/stats/weekly-leaderboard?weekStart=2026-04-14
     * Returns the leaderboard snapshot for a specific week.
     * If weekStart is omitted, returns the most recent snapshot.
     */
    @GetMapping("/weekly-leaderboard")
    public ResponseEntity<List<WeeklyLeaderboard>> getWeeklyLeaderboard(
            @RequestParam(required = false) String weekStart) {
        if (weekStart != null) {
            LocalDate date = LocalDate.parse(weekStart);
            log.info("GET /api/stats/weekly-leaderboard?weekStart={}", date);
            return ResponseEntity.ok(
                    weeklyLeaderboardRepository.findByWeekStartOrderByRankAsc(date));
        }
        // Return most recent week
        List<WeeklyLeaderboard> all = weeklyLeaderboardRepository
                .findDistinctByOrderByWeekStartDesc();
        if (all.isEmpty()) return ResponseEntity.ok(List.of());
        LocalDate latest = all.get(0).getWeekStart();
        log.info("GET /api/stats/weekly-leaderboard — latest week: {}", latest);
        return ResponseEntity.ok(
                weeklyLeaderboardRepository.findByWeekStartOrderByRankAsc(latest));
    }
}
