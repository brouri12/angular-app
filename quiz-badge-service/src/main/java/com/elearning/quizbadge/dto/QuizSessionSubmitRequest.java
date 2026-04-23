package com.elearning.quizbadge.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSessionSubmitRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long quizId;
    private List<QuizAnswerPayload> answers;
    private Integer durationSeconds;
    private Integer tabHiddenCount;
    private Integer clipboardBlockCount;
}
