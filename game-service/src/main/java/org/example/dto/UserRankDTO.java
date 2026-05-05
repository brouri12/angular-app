package org.example.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserRankDTO {
    private int rank;
    private String userId;
    private Integer totalScore;
    private Integer gamesPassed;
    private Double passRate;
    private Integer level;
    private Integer winStreak;
}
