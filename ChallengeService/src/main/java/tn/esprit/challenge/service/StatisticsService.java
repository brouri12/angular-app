package tn.esprit.challenge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.challenge.dto.*;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Question;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.enums.SubmissionStatus;
import tn.esprit.challenge.mapper.ChallengeMapper;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.QuestionRepository;
import tn.esprit.challenge.repository.SubmissionRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final SubmissionRepository submissionRepository;
    private final ChallengeRepository challengeRepository;
    private final QuestionRepository questionRepository;

    // ══════════════════════════════════════════════════════════════════════════
    // USER STATISTICS
    // ══════════════════════════════════════════════════════════════════════════

    public UserStatsDTO getUserStats(Long userId) {
        log.info("Computing stats for user {}", userId);

        // Basic counts
        long attempted  = submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PASSED)
                        + submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.FAILED)
                        + submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PARTIAL);
        long passed     = submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PASSED);
        long failed     = submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.FAILED);
        long partial    = submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PARTIAL);

        // Scores
        Integer totalScore   = submissionRepository.getTotalScoreByUserId(userId);
        Double  avgScore     = submissionRepository.getAverageScoreByUserId(userId);

        // Accuracy
        Integer totalCorrect   = submissionRepository.getTotalCorrectAnswersByUserId(userId);
        Integer totalQuestions = submissionRepository.getTotalQuestionsAnsweredByUserId(userId);
        double accuracy = (totalQuestions != null && totalQuestions > 0)
                ? (totalCorrect.doubleValue() / totalQuestions) * 100.0
                : 0.0;

        // Time
        Double avgTime     = submissionRepository.getAverageCompletionTimeByUserId(userId);
        Long   fastestTime = submissionRepository.getFastestCompletionTimeByUserId(userId);

        // Pass rate
        double passRate = attempted > 0 ? (passed * 100.0 / attempted) : 0.0;

        // Streak calculation
        int[] streaks = calculateStreaks(userId);

        // Breakdown by level
        Map<String, Integer> scoreByLevel   = toStringIntMap(submissionRepository.getScoreByLevelForUser(userId));
        Map<String, Integer> attemptsByLevel = toStringIntMap(submissionRepository.getAttemptsByLevelForUser(userId));

        // Breakdown by type
        Map<String, Integer> scoreByType   = toStringIntMap(submissionRepository.getScoreByTypeForUser(userId));
        Map<String, Integer> attemptsByType = toStringIntMap(submissionRepository.getAttemptsByTypeForUser(userId));

        return UserStatsDTO.builder()
                .userId(userId)
                .totalScore(totalScore != null ? totalScore : 0)
                .averageScore(round(avgScore))
                .totalChallengesAttempted((int) attempted)
                .totalChallengesPassed((int) passed)
                .totalChallengesFailed((int) failed)
                .totalChallengesPartial((int) partial)
                .overallAccuracy(round(accuracy))
                .totalQuestionsAnswered(totalQuestions != null ? totalQuestions : 0)
                .totalCorrectAnswers(totalCorrect != null ? totalCorrect : 0)
                .averageCompletionTimeSeconds(avgTime != null ? avgTime.longValue() : null)
                .fastestCompletionTimeSeconds(fastestTime)
                .currentStreak(streaks[0])
                .bestStreak(streaks[1])
                .passRate(round(passRate))
                .scoreByLevel(scoreByLevel)
                .attemptsByLevel(attemptsByLevel)
                .scoreByType(scoreByType)
                .attemptsByType(attemptsByType)
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CHALLENGE STATISTICS
    // ══════════════════════════════════════════════════════════════════════════

    public ChallengeStatsDTO getChallengeStats(Long challengeId) {
        log.info("Computing stats for challenge {}", challengeId);

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found: " + challengeId));

        long total   = submissionRepository.countByChallengeIdAndStatus(challengeId, SubmissionStatus.PASSED)
                     + submissionRepository.countByChallengeIdAndStatus(challengeId, SubmissionStatus.FAILED)
                     + submissionRepository.countByChallengeIdAndStatus(challengeId, SubmissionStatus.PARTIAL);
        long passed  = submissionRepository.countByChallengeIdAndStatus(challengeId, SubmissionStatus.PASSED);
        long failed  = submissionRepository.countByChallengeIdAndStatus(challengeId, SubmissionStatus.FAILED);
        long partial = submissionRepository.countByChallengeIdAndStatus(challengeId, SubmissionStatus.PARTIAL);

        Double avgScore     = submissionRepository.getAverageScoreByChallengeId(challengeId);
        Integer highScore   = submissionRepository.getHighestScoreByChallengeId(challengeId);
        Integer lowScore    = submissionRepository.getLowestScoreByChallengeId(challengeId);
        Double avgAccuracy  = submissionRepository.getAverageAccuracyByChallengeId(challengeId);
        Double avgTime      = submissionRepository.getAverageCompletionTimeByChallengeId(challengeId);
        Long   fastestTime  = submissionRepository.getFastestCompletionTimeByChallengeId(challengeId);

        double passRate = total > 0 ? (passed * 100.0 / total) : 0.0;

        // Per-question difficulty
        List<QuestionDifficultyDTO> difficulties = computeQuestionDifficulties(challengeId);

        return ChallengeStatsDTO.builder()
                .challengeId(challengeId)
                .challengeTitle(challenge.getTitle())
                .totalAttempts((int) total)
                .totalPassed((int) passed)
                .totalFailed((int) failed)
                .totalPartial((int) partial)
                .passRate(round(passRate))
                .averageScore(round(avgScore))
                .highestScore(highScore)
                .lowestScore(lowScore)
                .averageAccuracy(round(avgAccuracy))
                .averageCompletionTimeSeconds(avgTime != null ? avgTime.longValue() : null)
                .fastestCompletionTimeSeconds(fastestTime)
                .questionDifficulties(difficulties)
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GLOBAL STATISTICS
    // ══════════════════════════════════════════════════════════════════════════

    public GlobalStatsDTO getGlobalStats() {
        log.info("Computing global platform stats");

        long totalChallenges   = challengeRepository.count();
        long totalSubmissions  = submissionRepository.count();
        long totalUsers        = submissionRepository.countDistinctUsers();
        long totalPassed       = submissionRepository.countByStatus(SubmissionStatus.PASSED);

        Double globalPassRate  = totalSubmissions > 0 ? (totalPassed * 100.0 / totalSubmissions) : 0.0;
        Double globalAvgScore  = submissionRepository.getGlobalAverageScore();
        Double globalAvgAcc    = submissionRepository.getGlobalAverageAccuracy();

        // Top users (leaderboard)
        List<UserRankDTO> topUsers = buildLeaderboard();

        // Most attempted challenges
        List<ChallengeDTO> mostAttempted = challengeRepository
                .findTop10ByOrderByTotalAttemptsDesc().stream()
                .map(c -> ChallengeMapper.toDTO(c, false))
                .collect(Collectors.toList());

        // Hardest challenges
        List<ChallengeDTO> hardest = buildHardestChallenges();

        // Distributions
        Map<String, Long> byLevel = toStringLongMap(submissionRepository.countSubmissionsByLevel());
        Map<String, Long> byType  = toStringLongMap(submissionRepository.countSubmissionsByType());

        return GlobalStatsDTO.builder()
                .totalChallenges(totalChallenges)
                .totalSubmissions(totalSubmissions)
                .totalUsers(totalUsers)
                .totalPassedSubmissions(totalPassed)
                .globalPassRate(round(globalPassRate))
                .globalAverageScore(round(globalAvgScore))
                .globalAverageAccuracy(round(globalAvgAcc))
                .topUsers(topUsers)
                .mostAttemptedChallenges(mostAttempted)
                .hardestChallenges(hardest)
                .submissionsByLevel(byLevel)
                .submissionsByType(byType)
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LEADERBOARD
    // ══════════════════════════════════════════════════════════════════════════

    public List<UserRankDTO> getLeaderboard(int limit) {
        return buildLeaderboard().stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Compute per-question difficulty based on all submissions for a challenge.
     * For each question we count how many users answered it correctly.
     */
    private List<QuestionDifficultyDTO> computeQuestionDifficulties(Long challengeId) {
        List<Question> questions = questionRepository.findByChallengeIdOrderByOrderIndexAsc(challengeId);
        List<Submission> submissions = submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(challengeId);

        if (submissions.isEmpty()) return Collections.emptyList();

        List<QuestionDifficultyDTO> result = new ArrayList<>();

        for (Question q : questions) {
            int total   = 0;
            int correct = 0;

            for (Submission s : submissions) {
                String userAnswer = s.getAnswers().get(q.getId());
                if (userAnswer != null) {
                    total++;
                    if (isCorrect(q, userAnswer)) correct++;
                }
            }

            double rate = total > 0 ? (correct * 100.0 / total) : 0.0;

            result.add(QuestionDifficultyDTO.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .totalAnswered(total)
                    .totalCorrect(correct)
                    .correctRate(round(rate))
                    .difficultyLabel(difficultyLabel(rate))
                    .build());
        }

        return result;
    }

    private boolean isCorrect(Question q, String userAnswer) {
        if (userAnswer == null || userAnswer.isBlank()) return false;
        String norm = userAnswer.trim().toLowerCase();
        if (norm.equals(q.getCorrectAnswer().trim().toLowerCase())) return true;
        if (q.getAcceptableAnswers() != null) {
            return q.getAcceptableAnswers().stream()
                    .anyMatch(a -> norm.equals(a.trim().toLowerCase()));
        }
        return false;
    }

    private String difficultyLabel(double correctRate) {
        if (correctRate >= 80) return "EASY";
        if (correctRate >= 60) return "MEDIUM";
        if (correctRate >= 40) return "HARD";
        return "VERY_HARD";
    }

    /**
     * Calculate current and best streak (consecutive PASSED submissions ordered by date).
     */
    private int[] calculateStreaks(Long userId) {
        List<Submission> subs = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        if (subs.isEmpty()) return new int[]{0, 0};

        // Reverse to chronological order
        List<Submission> ordered = new ArrayList<>(subs);
        Collections.reverse(ordered);

        int current = 0, best = 0, streak = 0;
        for (Submission s : ordered) {
            if (s.getStatus() == SubmissionStatus.PASSED) {
                streak++;
                if (streak > best) best = streak;
            } else {
                streak = 0;
            }
        }
        // current streak = streak from the end
        current = 0;
        for (int i = ordered.size() - 1; i >= 0; i--) {
            if (ordered.get(i).getStatus() == SubmissionStatus.PASSED) current++;
            else break;
        }

        return new int[]{current, best};
    }

    private List<UserRankDTO> buildLeaderboard() {
        List<Object[]> rows = submissionRepository.getLeaderboard();
        List<UserRankDTO> list = new ArrayList<>();
        int rank = 1;
        for (Object[] row : rows) {
            Long userId     = ((Number) row[0]).longValue();
            Integer score   = ((Number) row[1]).intValue();
            long attempts   = ((Number) row[2]).longValue();
            long passed     = submissionRepository.countByUserIdAndStatus(userId, SubmissionStatus.PASSED);
            double passRate = attempts > 0 ? (passed * 100.0 / attempts) : 0.0;
            Integer correct = submissionRepository.getTotalCorrectAnswersByUserId(userId);
            Integer total   = submissionRepository.getTotalQuestionsAnsweredByUserId(userId);
            double acc      = (total != null && total > 0) ? (correct.doubleValue() / total * 100) : 0.0;

            list.add(UserRankDTO.builder()
                    .userId(userId)
                    .rank(rank++)
                    .totalScore(score)
                    .challengesPassed((int) passed)
                    .passRate(round(passRate))
                    .averageAccuracy(round(acc))
                    .build());
        }
        return list;
    }

    private List<ChallengeDTO> buildHardestChallenges() {
        List<Object[]> rows = submissionRepository.getHardestChallenges();
        return rows.stream()
                .limit(5)
                .map(row -> {
                    Long cid = ((Number) row[0]).longValue();
                    return challengeRepository.findById(cid)
                            .map(c -> ChallengeMapper.toDTO(c, false))
                            .orElse(null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ── Utility converters ─────────────────────────────────────────────────────

    private Map<String, Integer> toStringIntMap(List<Object[]> rows) {
        Map<String, Integer> map = new LinkedHashMap<>();
        if (rows != null) {
            rows.forEach(r -> map.put(r[0].toString(), ((Number) r[1]).intValue()));
        }
        return map;
    }

    private Map<String, Long> toStringLongMap(List<Object[]> rows) {
        Map<String, Long> map = new LinkedHashMap<>();
        if (rows != null) {
            rows.forEach(r -> map.put(r[0].toString(), ((Number) r[1]).longValue()));
        }
        return map;
    }

    private Double round(Double value) {
        if (value == null) return 0.0;
        return Math.round(value * 100.0) / 100.0;
    }
}
