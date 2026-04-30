package com.elearning.quizbadge.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSessionSubmitResponse {
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerQuestion {
        private Long questionId;
        private boolean correct;
        private Integer earnedPoints;
    }

    private Long sessionId;
    private Integer scorePercent;
    private Integer pointsEarned;
    private Integer totalPoints;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer unansweredCount;
    private Integer durationSeconds;
    private boolean passed;
    private List<PerQuestion> perQuestion;
    /** Valeurs persistées après soumission (intégrité quiz). */
    private Integer tabHiddenCount;
    private Integer clipboardBlockCount;

    /** Compteurs proctoring caméra (agrégés pendant la session). */
    private Integer proctoringPhoneCount;
    private Integer proctoringMultiPersonCount;
    private Integer proctoringCameraLostCount;
    private String proctoringLastEvent;
}
