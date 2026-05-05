package org.example.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GlobalStatsDTO {
    private long totalGames;
    private long totalSubmissions;
    private long totalPlayers;
    private Double globalPassRate;
    private Double globalAverageScore;
    private List<UserRankDTO> leaderboard;
}
