package tn.esprit.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDifficultyDTO {
    private Long questionId;
    private String questionText;
    private Integer totalAnswered;
    private Integer totalCorrect;
    private Double correctRate;         // % of users who got it right
    private String difficultyLabel;     // EASY / MEDIUM / HARD / VERY_HARD
}
