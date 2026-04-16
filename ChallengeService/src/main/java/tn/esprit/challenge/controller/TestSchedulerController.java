package tn.esprit.challenge.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.challenge.scheduler.AdvancedScheduler;
import tn.esprit.challenge.scheduler.WeeklyChallengeScheduler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * ⚠️  TEST-ONLY controller — triggers schedulers manually via HTTP.
 *
 * Use this to test all new features without waiting for the real cron times.
 *
 * Endpoints:
 *   POST /api/test/scheduler/weekly-challenge     → create this week's challenge now
 *   POST /api/test/scheduler/leaderboard-snapshot → snapshot weekly leaderboard now
 *   POST /api/test/scheduler/admin-report         → send weekly admin report email now
 *   POST /api/test/scheduler/expire-challenges    → expire old challenges now
 *   POST /api/test/scheduler/streak-reminders     → send streak reminder emails now
 *   POST /api/test/scheduler/run-all              → run all tasks in sequence
 */
@RestController
@RequestMapping("/api/test/scheduler")
@RequiredArgsConstructor
@Slf4j
public class TestSchedulerController {

    private final WeeklyChallengeScheduler weeklyChallengeScheduler;
    private final AdvancedScheduler        advancedScheduler;

    // ── ① Weekly challenge creation ────────────────────────────────────────────

    @PostMapping("/weekly-challenge")
    public ResponseEntity<Map<String, Object>> triggerWeeklyChallenge() {
        log.info("🧪 [TEST] Triggering weekly challenge creation...");
        long start = System.currentTimeMillis();
        try {
            weeklyChallengeScheduler.createWeeklyChallenge();
            return ok("weekly-challenge", "Challenge of the Week created successfully", start);
        } catch (Exception e) {
            return error("weekly-challenge", e.getMessage(), start);
        }
    }

    // ── ② Leaderboard snapshot ─────────────────────────────────────────────────

    @PostMapping("/leaderboard-snapshot")
    public ResponseEntity<Map<String, Object>> triggerLeaderboardSnapshot() {
        log.info("🧪 [TEST] Triggering leaderboard snapshot...");
        long start = System.currentTimeMillis();
        try {
            advancedScheduler.snapshotAndResetWeeklyLeaderboard();
            return ok("leaderboard-snapshot", "Weekly leaderboard snapshot saved", start);
        } catch (Exception e) {
            return error("leaderboard-snapshot", e.getMessage(), start);
        }
    }

    // ── ③ Admin report email ───────────────────────────────────────────────────

    @PostMapping("/admin-report")
    public ResponseEntity<Map<String, Object>> triggerAdminReport() {
        log.info("🧪 [TEST] Triggering weekly admin report email...");
        long start = System.currentTimeMillis();
        try {
            advancedScheduler.sendWeeklyAdminReport();
            return ok("admin-report", "Weekly admin report email sent", start);
        } catch (Exception e) {
            return error("admin-report", e.getMessage(), start);
        }
    }

    // ── ④ Challenge expiration ─────────────────────────────────────────────────

    @PostMapping("/expire-challenges")
    public ResponseEntity<Map<String, Object>> triggerExpireChallenges() {
        log.info("🧪 [TEST] Triggering challenge expiration check...");
        long start = System.currentTimeMillis();
        try {
            advancedScheduler.expireChallenges();
            return ok("expire-challenges", "Challenge expiration check completed", start);
        } catch (Exception e) {
            return error("expire-challenges", e.getMessage(), start);
        }
    }

    // ── ⑤ Streak reminder emails ───────────────────────────────────────────────

    @PostMapping("/streak-reminders")
    public ResponseEntity<Map<String, Object>> triggerStreakReminders() {
        log.info("🧪 [TEST] Triggering streak reminder emails...");
        long start = System.currentTimeMillis();
        try {
            advancedScheduler.sendStreakReminders();
            return ok("streak-reminders", "Streak reminder emails sent", start);
        } catch (Exception e) {
            return error("streak-reminders", e.getMessage(), start);
        }
    }

    // ── Run all ────────────────────────────────────────────────────────────────

    @PostMapping("/run-all")
    public ResponseEntity<Map<String, Object>> runAll() {
        log.info("🧪 [TEST] Running ALL schedulers in sequence...");
        Map<String, Object> results = new LinkedHashMap<>();
        results.put("timestamp", LocalDateTime.now().toString());

        run(results, "leaderboard-snapshot",
                advancedScheduler::snapshotAndResetWeeklyLeaderboard);
        run(results, "admin-report",
                advancedScheduler::sendWeeklyAdminReport);
        run(results, "weekly-challenge",
                weeklyChallengeScheduler::createWeeklyChallenge);
        run(results, "expire-challenges",
                advancedScheduler::expireChallenges);
        run(results, "streak-reminders",
                advancedScheduler::sendStreakReminders);

        log.info("🧪 [TEST] All schedulers completed.");
        return ResponseEntity.ok(results);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void run(Map<String, Object> results, String name, Runnable task) {
        long start = System.currentTimeMillis();
        try {
            task.run();
            results.put(name, Map.of(
                    "status", "✅ OK",
                    "durationMs", System.currentTimeMillis() - start
            ));
        } catch (Exception e) {
            results.put(name, Map.of(
                    "status", "❌ ERROR",
                    "error", e.getMessage(),
                    "durationMs", System.currentTimeMillis() - start
            ));
        }
    }

    private ResponseEntity<Map<String, Object>> ok(String task, String message, long start) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("task", task);
        body.put("status", "✅ OK");
        body.put("message", message);
        body.put("durationMs", System.currentTimeMillis() - start);
        body.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(body);
    }

    private ResponseEntity<Map<String, Object>> error(String task, String message, long start) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("task", task);
        body.put("status", "❌ ERROR");
        body.put("error", message);
        body.put("durationMs", System.currentTimeMillis() - start);
        body.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.internalServerError().body(body);
    }
}
