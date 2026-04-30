package com.elearning.quizbadge.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSessionSaveRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long quizId;
    private List<QuizAnswerPayload> answers;
    private Integer currentStep;
    private Integer durationSeconds;
    /** Compteur onglet masqué (client), fusionné au max côté serveur. */
    private Integer tabHiddenCount;
    /** Tentatives copier/coller/couper bloquées (client). */
    private Integer clipboardBlockCount;
}
