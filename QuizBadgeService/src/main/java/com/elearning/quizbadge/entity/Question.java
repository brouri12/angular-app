package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Question entity representing a quiz question.
 */
@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "course_id", nullable = false)
    private Long courseId;
    
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 50)
    private QuestionType questionType;
    
    @Column(name = "points", nullable = false)
    private Integer points;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", nullable = false, length = 50)
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "correct_answer", length = 1000)
    private String correctAnswer;
    
    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;
    
    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (questionType == null) {
            questionType = QuestionType.MULTIPLE_CHOICE;
        }
        if (difficultyLevel == null) {
            difficultyLevel = DifficultyLevel.MEDIUM;
        }
        if (points == null) {
            points = 1;
        }
        if (orderNumber == null) {
            orderNumber = 1;
        }
        if (isActive == null) {
            isActive = true;
        }
    }
    
    /**
     * Question type enumeration.
     */
    public enum QuestionType {
        MULTIPLE_CHOICE,
        TRUE_FALSE,
        SHORT_ANSWER,
        ESSAY,
        FILL_IN_BLANK
    }
    
    /**
     * Difficulty level enumeration.
     */
    public enum DifficultyLevel {
        EASY,
        MEDIUM,
        HARD,
        EXPERT
    }
}
