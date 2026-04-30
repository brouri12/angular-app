package com.elearning.quizbadge.web;

import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * Modèle pour la page de passage du quiz (Thymeleaf).
 */
@Value
@Builder
public class QuizPlayPage {
    String quizTitle;
    Long quizId;
    Long studentId;
    Long sessionId;
    Integer timeLimitSeconds;
    Integer remainingSeconds;
    /** Reprise session : compteurs déjà enregistrés côté serveur. */
    Integer tabHiddenCount;
    Integer clipboardBlockCount;
    List<QuizQuestionRow> questions;
}
