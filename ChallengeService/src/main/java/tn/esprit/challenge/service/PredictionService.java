package tn.esprit.challenge.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.challenge.dto.PredictionDTO;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.SubmissionStatus;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.SubmissionRepository;

import java.util.List;

/**
 * Predicts the probability that a given user will pass a given challenge,
 * based on their historical performance profile.
 *
 * Algorithm (weighted scoring):
 *  1. Base pass rate of the user overall                    (30%)
 *  2. User's pass rate on the same challenge TYPE           (25%)
 *  3. User's pass rate on the same LEVEL                    (25%)
 *  4. Global pass rate of the challenge itself              (10%)
 *  5. Streak bonus / penalty                                (10%)
 *
 * Result is clamped to [5%, 97%] to avoid overconfident predictions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    private final SubmissionRepository submissionRepository;
    private final ChallengeRepository  challengeRepository;

    /**
     * Predict success probability for userId on challengeId.
     */
    public PredictionDTO predict(Long userId, Long challengeId) {
        log.info("Predicting success for user {} on challenge {}", userId, challengeId);

        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found: " + challengeId));

        List<Submission> userSubs = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        List<Submission> challengeSubs = submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(challengeId);

        // ── 1. Overall user pass rate ──────────────────────────────────────────
        double overallPassRate = computePassRate(userSubs);

        // ── 2. User pass rate on same TYPE ────────────────────────────────────
        List<Submission> sameTypeSubs = userSubs.stream()
                .filter(s -> {
                    Challenge c = challengeRepository.findById(s.getChallengeId()).orElse(null);
                    return c != null && c.getType() == challenge.getType();
                }).toList();
        double typePassRate = sameTypeSubs.isEmpty() ? overallPassRate : computePassRate(sameTypeSubs);

        // ── 3. User pass rate on same LEVEL ───────────────────────────────────
        List<Submission> sameLevelSubs = userSubs.stream()
                .filter(s -> {
                    Challenge c = challengeRepository.findById(s.getChallengeId()).orElse(null);
                    return c != null && c.getLevel() == challenge.getLevel();
                }).toList();
        double levelPassRate = sameLevelSubs.isEmpty() ? overallPassRate : computePassRate(sameLevelSubs);

        // ── 4. Global challenge pass rate ─────────────────────────────────────
        double challengePassRate = challengeSubs.isEmpty() ? 60.0 : computePassRate(challengeSubs);

        // ── 5. Streak factor ──────────────────────────────────────────────────
        int currentStreak = computeCurrentStreak(userSubs);
        double streakBonus = Math.min(currentStreak * 2.0, 10.0); // max +10%

        // ── Weighted combination ───────────────────────────────────────────────
        double raw = (overallPassRate  * 0.30)
                   + (typePassRate     * 0.25)
                   + (levelPassRate    * 0.25)
                   + (challengePassRate * 0.10)
                   + streakBonus;

        // Level difficulty adjustment
        raw = applyLevelAdjustment(raw, challenge.getLevel());

        // Clamp to [5, 97]
        double probability = Math.max(5.0, Math.min(97.0, raw));
        probability = Math.round(probability * 10.0) / 10.0;

        // ── Build explanation ──────────────────────────────────────────────────
        String advice = buildAdvice(probability, currentStreak, userSubs.size(),
                sameTypeSubs.size(), sameLevelSubs.size());

        String confidence = probability >= 75 ? "HIGH"
                          : probability >= 50 ? "MEDIUM"
                          : "LOW";

        return PredictionDTO.builder()
                .userId(userId)
                .challengeId(challengeId)
                .challengeTitle(challenge.getTitle())
                .challengeType(challenge.getType().name())
                .challengeLevel(challenge.getLevel().name())
                .successProbability(probability)
                .confidence(confidence)
                .userOverallPassRate(round(overallPassRate))
                .userTypePassRate(round(typePassRate))
                .userLevelPassRate(round(levelPassRate))
                .challengeGlobalPassRate(round(challengePassRate))
                .currentStreak(currentStreak)
                .totalSubmissions(userSubs.size())
                .advice(advice)
                .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private double computePassRate(List<Submission> subs) {
        if (subs.isEmpty()) return 50.0; // neutral prior
        long passed = subs.stream().filter(s -> s.getStatus() == SubmissionStatus.PASSED).count();
        return (passed * 100.0) / subs.size();
    }

    private int computeCurrentStreak(List<Submission> subsDesc) {
        int streak = 0;
        for (Submission s : subsDesc) {
            if (s.getStatus() == SubmissionStatus.PASSED) streak++;
            else break;
        }
        return streak;
    }

    private double applyLevelAdjustment(double base, ProficiencyLevel level) {
        return switch (level) {
            case A1 -> base + 5.0;
            case A2 -> base + 2.0;
            case B1 -> base;
            case B2 -> base - 3.0;
            case C1 -> base - 7.0;
            case C2 -> base - 12.0;
        };
    }

    private String buildAdvice(double prob, int streak, int totalSubs,
                               int typeSubs, int levelSubs) {
        if (totalSubs == 0) {
            return "No history yet — give it a try! Your first attempt is always a learning experience.";
        }
        if (prob >= 80) {
            return "You're well prepared for this challenge. " +
                   (streak > 0 ? "Keep your " + streak + "-day streak going! 🔥" : "Go for it! 🎯");
        }
        if (prob >= 60) {
            return "Good chance of passing. " +
                   (typeSubs < 3 ? "You have limited experience with this type — review the basics first." :
                    "Stay focused and take your time.");
        }
        if (prob >= 40) {
            return "This will be challenging. " +
                   (levelSubs < 3 ? "You haven't done many challenges at this level — consider a lower level first." :
                    "Review your past mistakes before attempting.");
        }
        return "This challenge is very difficult for your current profile. " +
               "We recommend practicing easier challenges first to build confidence.";
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
