package com.elearning.quizbadge.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSessionStartResponse {
    private Long id;
    private Integer attemptId;
    private Integer durationSeconds;
    private Integer currentStep;
    private List<QuizAnswerPayload> answers;
    private Integer timeLimitSeconds;
    private Integer maxAttempts;
    private Integer remainingSeconds;
    private Integer tabHiddenCount;
    private Integer clipboardBlockCount;

    private Integer proctoringPhoneCount;
    private Integer proctoringMultiPersonCount;
    private Integer proctoringCameraLostCount;
    private String proctoringLastEvent;
}
