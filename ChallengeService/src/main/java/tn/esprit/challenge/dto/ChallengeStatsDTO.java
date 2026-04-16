package tn.esprit.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeStatsDTO {

    private Long challengeId;
    private String challengeTitle;

    // Attempt stats
    private Integer totalAttempts;
    private Integer totalPassed;
    private Integer totalFailed;
    private Integer totalPartial;
    private Double passRate;

    // Score stats
    private Double averageScore;
    private Integer highestScore;
    private Integer lowestScore;

    // Accuracy
    private Double averageAccuracy;         // average % correct per submission

    // Time stats
    private Long averageCompletionTimeSeconds;
    private Long fastestCompletionTimeSeconds;

    // Per-question difficulty
    private List<QuestionDifficultyDTO> questionDifficulties;
}
