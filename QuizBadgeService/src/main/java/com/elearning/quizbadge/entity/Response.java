package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Response entity representing a student's answer to a question.
 */
@Entity
@Table(name = "responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Response {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "question_id", nullable = false)
    private Long questionId;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "enrollment_id", nullable = false)
    private Long enrollmentId;
    
    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;
    
    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;
    
    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned;
    
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;
    
    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    @PrePersist
    protected void onCreate() {
        if (isCorrect == null) {
            isCorrect = false;
        }
        if (pointsEarned == null) {
            pointsEarned = 0;
        }
        if (attemptNumber == null) {
            attemptNumber = 1;
        }
        if (timeSpentSeconds == null) {
            timeSpentSeconds = 0;
        }
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
