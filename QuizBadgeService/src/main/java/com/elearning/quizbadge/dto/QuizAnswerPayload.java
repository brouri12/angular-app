package com.elearning.quizbadge.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswerPayload {
    private Long questionId;
    private String answerText;
    private Integer timeSpentSeconds;
    private Boolean markedForReview;
}
