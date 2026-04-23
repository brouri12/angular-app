package com.elearning.quizbadge.web;

import com.elearning.quizbadge.entity.QuizQuestion;
import lombok.Builder;
import lombok.Value;

/**
 * Données affichées dans Thymeleaf (sans {@code correctAnswer}).
 */
@Value
@Builder
public class QuizQuestionRow {
    Long id;
    String questionText;
    QuizQuestion.QuestionType questionType;
    Integer points;
    Integer orderNumber;

    public static QuizQuestionRow from(QuizQuestion q) {
        return QuizQuestionRow.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .points(q.getPoints())
                .orderNumber(q.getOrderNumber())
                .build();
    }
}
