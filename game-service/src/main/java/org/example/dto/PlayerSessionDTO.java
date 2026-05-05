package org.example.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerSessionDTO {
    private String userId;
    private Integer lives;
    private Integer level;
    private Integer progressBar;
    private Integer gamesWon;
    private Integer gamesLost;
    private Integer totalGamesPlayed;
    private Integer totalXP;
    private Integer winStreak;
    private Integer bestStreak;
    private Integer totalStars;
    private Boolean gameOver;
}
