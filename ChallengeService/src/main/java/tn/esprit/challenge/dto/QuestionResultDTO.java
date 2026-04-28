package tn.esprit.challenge.dto;

import lombok.Data;

@Data
public class QuestionResultDTO {
    private Long questionId;
    private String userAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private Integer pointsEarned;
    private String explanation;
}
