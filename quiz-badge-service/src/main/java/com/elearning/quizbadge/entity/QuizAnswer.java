package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "quiz_answers",
        uniqueConstraints = @UniqueConstraint(name = "uk_attempt_question", columnNames = {"attempt_id", "question_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attempt_id", nullable = false)
    private Long attemptId;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "earned_points", nullable = false)
    private Integer earnedPoints;

    @Column(name = "time_spent_seconds", nullable = false)
    private Integer timeSpentSeconds;

    @Column(name = "marked_for_review", nullable = false)
    private Boolean markedForReview;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (isCorrect == null) isCorrect = false;
        if (earnedPoints == null) earnedPoints = 0;
        if (timeSpentSeconds == null) timeSpentSeconds = 0;
        if (markedForReview == null) markedForReview = false;
    }
}
