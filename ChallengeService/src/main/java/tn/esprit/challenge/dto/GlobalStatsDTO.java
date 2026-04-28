package tn.esprit.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalStatsDTO {

    // Platform totals
    private Long totalChallenges;
    private Long totalSubmissions;
    private Long totalUsers;
    private Long totalPassedSubmissions;

    // Averages
    private Double globalPassRate;
    private Double globalAverageScore;
    private Double globalAverageAccuracy;

    // Top performers
    private List<UserRankDTO> topUsers;

    // Most popular challenges
    private List<ChallengeDTO> mostAttemptedChallenges;

    // Hardest challenges (lowest pass rate)
    private List<ChallengeDTO> hardestChallenges;

    // Distribution by level
    private Map<String, Long> submissionsByLevel;

    // Distribution by type
    private Map<String, Long> submissionsByType;
}
