package com.elearning.quizbadge.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSessionStartRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long quizId;
}
