package org.example.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsDTO {
    private String userId;
    private Integer totalScore;
    private Integer totalGamesPlayed;
    private Integer totalGamesPassed;
    private Integer totalGamesFailed;
    private Double passRate;
    private Double overallAccuracy;
    private Integer currentStreak;
    private Integer bestStreak;
    private Integer level;
    private Integer progressBar;
    private Integer totalXP;
}
