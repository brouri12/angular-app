package tn.esprit.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {

    private Long userId;

    // Overall scores
    private Integer totalScore;
    private Double averageScore;
    private Integer totalChallengesAttempted;
    private Integer totalChallengesPassed;
    private Integer totalChallengesFailed;
    private Integer totalChallengesPartial;

    // Accuracy
    private Double overallAccuracy;         // % of correct answers across all submissions
    private Integer totalQuestionsAnswered;
    private Integer totalCorrectAnswers;

    // Time
    private Long averageCompletionTimeSeconds;
    private Long fastestCompletionTimeSeconds;

    // Streaks & progress
    private Integer currentStreak;          // consecutive passed challenges
    private Integer bestStreak;

    // Breakdown by level
    private Map<String, Integer> scoreByLevel;       // A1 -> 45, B1 -> 30 ...
    private Map<String, Integer> attemptsByLevel;

    // Breakdown by type
    private Map<String, Integer> scoreByType;        // GRAMMAR -> 20 ...
    private Map<String, Integer> attemptsByType;

    // Pass rate
    private Double passRate;                // % of passed / total attempted
}
