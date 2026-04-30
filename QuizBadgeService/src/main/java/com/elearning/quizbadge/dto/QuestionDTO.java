package com.elearning.quizbadge.dto;

import com.elearning.quizbadge.entity.Question;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Question.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {
    
    private Long id;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotBlank(message = "Question text is required")
    private String questionText;
    
    private Question.QuestionType questionType;
    
    private Integer points;
    
    private Question.DifficultyLevel difficultyLevel;
    
    private String correctAnswer;
    
    private String explanation;
    
    private Integer orderNumber;
    
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    /**
     * Convert from entity to DTO.
     */
    public static QuestionDTO fromEntity(Question question) {
        return QuestionDTO.builder()
                .id(question.getId())
                .courseId(question.getCourseId())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .points(question.getPoints())
                .difficultyLevel(question.getDifficultyLevel())
                .correctAnswer(question.getCorrectAnswer())
                .explanation(question.getExplanation())
                .orderNumber(question.getOrderNumber())
                .isActive(question.getIsActive())
                .createdAt(question.getCreatedAt())
                .build();
    }
    
    /**
     * Convert from DTO to entity.
     */
    public Question toEntity() {
        return Question.builder()
                .id(this.id)
                .courseId(this.courseId)
                .questionText(this.questionText)
                .questionType(this.questionType)
                .points(this.points)
                .difficultyLevel(this.difficultyLevel)
                .correctAnswer(this.correctAnswer)
                .explanation(this.explanation)
                .orderNumber(this.orderNumber)
                .isActive(this.isActive)
                .build();
    }
}
