package tn.esprit.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRankDTO {
    private Long userId;
    private Integer rank;
    private Integer totalScore;
    private Integer challengesPassed;
    private Double passRate;
    private Double averageAccuracy;
}
