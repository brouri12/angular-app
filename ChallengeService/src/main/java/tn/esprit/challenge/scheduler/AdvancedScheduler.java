package tn.esprit.challenge.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.challenge.client.UserServiceClient;
import tn.esprit.challenge.dto.GlobalStatsDTO;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.entity.WeeklyLeaderboard;
import tn.esprit.challenge.enums.SubmissionStatus;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.SubmissionRepository;
import tn.esprit.challenge.repository.WeeklyLeaderboardRepository;
import tn.esprit.challenge.service.ChallengeEmailService;
import tn.esprit.challenge.service.StatisticsService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced scheduler handling 4 automated business tasks:
 *
 *  ① Every Monday 07:00  — Snapshot & reset weekly leaderboard
 *  ② Every Monday 07:30  — Send weekly admin report email
 *  ③ Every day   09:00  — Expire challenges past their expiresAt date
 *  ④ Every day   10:00  — Send streak reminder to inactive users (3+ days)
 *
 * NOTE: The weekly challenge creation is handled by WeeklyChallengeScheduler (08:00).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdvancedScheduler {

    private final SubmissionRepository        submissionRepository;
    private final ChallengeRepository         challengeRepository;
    private final WeeklyLeaderboardRepository weeklyLeaderboardRepository;
    private final ChallengeEmailService       emailService;
    private final StatisticsService           statisticsService;
    private final UserServiceClient           userServiceClient;

    // ══════════════════════════════════════════════════════════════════════════
    // ① WEEKLY LEADERBOARD SNAPSHOT + RESET  — Every Monday at 07:00
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Every Monday at 07:00:
     *  1. Collect all submissions from the past Mon–Sun window
     *  2. Compute score / passed / accuracy per user
     *  3. Sort by totalScore, assign ranks 1→N
     *  4. Persist snapshot in weekly_leaderboard table
     *
     * "Reset" means the new week starts fresh — the leaderboard is always
     * computed from a date-filtered window, so no data is deleted.
     * The snapshot IS the reset boundary.
     */
    @Scheduled(cron = "0 0 7 * * MON")
    @Transactional
    public void snapshotAndResetWeeklyLeaderboard() {
        log.info("⏰ [AdvancedScheduler] Monday 07:00 — snapshotting weekly leaderboard...");

        LocalDate weekEnd   = LocalDate.now().minusDays(1); // last Sunday
        LocalDate weekStart = weekEnd.minusDays(6);         // last Monday

        // Avoid duplicate snapshots
        if (weeklyLeaderboardRepository.existsByWeekStart(weekStart)) {
            log.warn("⚠️  Leaderboard snapshot for {} already exists — skipping.", weekStart);
            return;
        }

        // Collect all submissions from the past week
        LocalDateTime from = weekStart.atStartOfDay();
        LocalDateTime to   = weekEnd.atTime(23, 59, 59);

        List<Submission> weekSubs = submissionRepository.findAll().stream()
                .filter(s -> !s.getSubmittedAt().isBefore(from) && !s.getSubmittedAt().isAfter(to))
                .toList();

        if (weekSubs.isEmpty()) {
            log.info("ℹ️  No submissions last week — skipping leaderboard snapshot.");
            return;
        }

        // Group by userId → compute score, passed, accuracy
        Map<Long, List<Submission>> byUser = weekSubs.stream()
                .collect(Collectors.groupingBy(Submission::getUserId));

        List<WeeklyLeaderboard> entries = new ArrayList<>();
        for (Map.Entry<Long, List<Submission>> entry : byUser.entrySet()) {
            Long userId = entry.getKey();
            List<Submission> subs = entry.getValue();

            int totalScore = subs.stream()
                    .filter(s -> s.getStatus() == SubmissionStatus.PASSED)
                    .mapToInt(Submission::getScore).sum();

            long passed = subs.stream()
                    .filter(s -> s.getStatus() == SubmissionStatus.PASSED).count();

            double passRate = (passed * 100.0) / subs.size();

            int totalCorrect   = subs.stream()
                    .mapToInt(s -> s.getCorrectAnswers() != null ? s.getCorrectAnswers() : 0).sum();
            int totalQuestions = subs.stream()
                    .mapToInt(s -> s.getTotalQuestions() != null ? s.getTotalQuestions() : 0).sum();
            double accuracy    = totalQuestions > 0 ? (totalCorrect * 100.0 / totalQuestions) : 0.0;

            entries.add(WeeklyLeaderboard.builder()
                    .weekStart(weekStart)
                    .weekEnd(weekEnd)
                    .rank(0)           // assigned below after sorting
                    .userId(userId)
                    .totalScore(totalScore)
                    .challengesPassed((int) passed)
                    .passRate(Math.round(passRate * 10.0) / 10.0)
                    .averageAccuracy(Math.round(accuracy * 10.0) / 10.0)
                    .build());
        }

        // Sort by totalScore desc, assign ranks
        entries.sort(Comparator.comparingInt(WeeklyLeaderboard::getTotalScore).reversed());
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        weeklyLeaderboardRepository.saveAll(entries);

        log.info("✅ [AdvancedScheduler] Leaderboard snapshot saved: {} entries for week {}→{}",
                entries.size(), weekStart, weekEnd);

        if (!entries.isEmpty()) {
            WeeklyLeaderboard champion = entries.get(0);
            log.info("🏆 Champion of the week: User #{} with {} points",
                    champion.getUserId(), champion.getTotalScore());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ② WEEKLY ADMIN REPORT EMAIL  — Every Monday at 07:30
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Every Monday at 07:30 — after the leaderboard snapshot (07:00) —
     * sends a rich HTML report email to the admin with:
     *  - Global platform stats (total submissions, pass rate, avg score)
     *  - Top 5 of the past week from the fresh snapshot
     *  - Preview of the new challenge title being created at 08:00
     */
    @Scheduled(cron = "0 30 7 * * MON")
    public void sendWeeklyAdminReport() {
        log.info("⏰ [AdvancedScheduler] Monday 07:30 — sending weekly admin report...");

        try {
            LocalDate weekEnd   = LocalDate.now().minusDays(1);
            LocalDate weekStart = weekEnd.minusDays(6);

            GlobalStatsDTO stats = statisticsService.getGlobalStats();

            List<WeeklyLeaderboard> top5 = weeklyLeaderboardRepository
                    .findTop10ByWeekStartOrderByRankAsc(weekStart)
                    .stream().limit(5).toList();

            // Preview title of the challenge that WeeklyChallengeScheduler will create at 08:00
            String newChallengeTitle = "Weekly Challenge — "
                    + LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            emailService.sendWeeklyAdminReport(stats, top5, weekStart, weekEnd, newChallengeTitle);

        } catch (Exception e) {
            log.error("❌ [AdvancedScheduler] Failed to send weekly report: {}", e.getMessage(), e);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ③ CHALLENGE EXPIRATION  — Every day at 09:00
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Every day at 09:00 — scans all non-expired challenges and marks as
     * expired any whose expiresAt timestamp is in the past.
     *
     * Auto-expiration rule for weekly challenges:
     *   If a challenge has the "weekly" tag but no expiresAt set,
     *   it is automatically given expiresAt = createdAt + 7 days.
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void expireChallenges() {
        log.info("⏰ [AdvancedScheduler] Daily 09:00 — checking challenge expiration...");

        LocalDateTime now = LocalDateTime.now();
        List<Challenge> active = challengeRepository.findAll().stream()
                .filter(c -> Boolean.FALSE.equals(c.getIsExpired()))
                .toList();

        int expired = 0;
        for (Challenge c : active) {
            // Auto-set expiration for weekly challenges that have none
            if (c.getExpiresAt() == null
                    && c.getTags() != null
                    && c.getTags().contains("weekly")) {
                c.setExpiresAt(c.getCreatedAt().plusDays(7));
            }

            if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(now)) {
                c.setIsExpired(true);
                challengeRepository.save(c);
                expired++;
                log.info("⌛ Challenge '{}' (id={}) marked as expired.", c.getTitle(), c.getId());
            }
        }

        if (expired == 0) {
            log.info("✅ No challenges expired today.");
        } else {
            log.info("✅ {} challenge(s) marked as expired.", expired);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ④ STREAK REMINDER EMAILS  — Every day at 10:00
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Every day at 10:00 — finds users who haven't submitted a challenge
     * in the last 3 days and sends them a personalised streak reminder email.
     *
     * Flow:
     *  1. Collect all distinct userIds from submissions
     *  2. Filter those whose latest submission is older than 3 days
     *  3. Bulk-resolve their emails via UserService (single HTTP call)
     *  4. Send reminder email to each inactive user
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void sendStreakReminders() {
        log.info("⏰ [AdvancedScheduler] Daily 10:00 — checking streak reminders...");

        LocalDateTime threeDaysAgo = LocalDateTime.now().minusDays(3);

        // Step 1 — find all users with at least one submission
        List<Long> allUserIds = submissionRepository.findAll().stream()
                .map(Submission::getUserId)
                .distinct()
                .toList();

        if (allUserIds.isEmpty()) {
            log.info("ℹ️  No users with submissions — skipping streak reminders.");
            return;
        }

        // Step 2 — identify inactive users (no submission in last 3 days)
        List<Long> inactiveUserIds = new ArrayList<>();
        Map<Long, Long>  daysSinceMap = new HashMap<>();
        Map<Long, Integer> streakMap  = new HashMap<>();

        for (Long userId : allUserIds) {
            List<Submission> subs = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
            if (subs.isEmpty()) continue;

            Submission latest = subs.get(0);
            if (latest.getSubmittedAt().isBefore(threeDaysAgo)) {
                long daysSince = ChronoUnit.DAYS.between(
                        latest.getSubmittedAt().toLocalDate(), LocalDate.now());

                // Compute current streak (consecutive PASSED from most recent)
                int streak = 0;
                for (Submission s : subs) {
                    if (s.getStatus() == SubmissionStatus.PASSED) streak++;
                    else break;
                }

                inactiveUserIds.add(userId);
                daysSinceMap.put(userId, daysSince);
                streakMap.put(userId, streak);
            }
        }

        if (inactiveUserIds.isEmpty()) {
            log.info("✅ All users are active — no streak reminders needed.");
            return;
        }

        // Step 3 — bulk-resolve emails from UserService (one HTTP call)
        Map<Long, String> emailMap = userServiceClient.getEmailsByIds(inactiveUserIds);

        // Step 4 — send reminder to each inactive user
        int reminded = 0;
        for (Long userId : inactiveUserIds) {
            String email = emailMap.get(userId);
            if (email == null || email.isBlank()) {
                log.warn("⚠️  No email found for user {} — skipping reminder.", userId);
                continue;
            }

            emailService.sendStreakReminder(
                    email,
                    userId,
                    streakMap.getOrDefault(userId, 0),
                    daysSinceMap.getOrDefault(userId, 3L)
            );
            reminded++;
        }

        log.info("✅ [AdvancedScheduler] Streak reminders sent to {} user(s).", reminded);
    }
}
