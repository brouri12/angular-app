package com.elearning.quizbadge.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizEligibilityResponse {
    private boolean allowed;
    private String message;
    private Integer attemptsUsed;
    private Integer maxAttempts;
    private Integer timeLimitSeconds;
    private Integer minDelayMinutesBetweenAttempts;
    private Integer lessonsDone;
    private Integer lessonsTotal;
}
