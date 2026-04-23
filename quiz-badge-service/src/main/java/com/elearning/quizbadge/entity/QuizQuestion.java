package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestion {

    public enum QuestionType {
        TRUE_FALSE,
        MULTIPLE_CHOICE,
        SHORT_ANSWER
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 40)
    private QuestionType questionType;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (questionType == null) questionType = QuestionType.SHORT_ANSWER;
        if (points == null) points = 1;
        if (orderNumber == null) orderNumber = 1;
        if (isActive == null) isActive = true;
    }
}
