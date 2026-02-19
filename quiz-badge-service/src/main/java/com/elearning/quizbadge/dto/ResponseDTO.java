package com.elearning.quizbadge.dto;

import com.elearning.quizbadge.entity.Response;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseDTO {
    
    private Long id;
    
    @NotNull(message = "Question ID is required")
    private Long questionId;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private Long enrollmentId;
    
    private String answerText;
    
    private Boolean isCorrect;
    
    private Integer pointsEarned;
    
    private Integer attemptNumber;
    
    private Integer timeSpentSeconds;
    
    private LocalDateTime submittedAt;
    
    /**
     * Convert from entity to DTO.
     */
    public static ResponseDTO fromEntity(Response response) {
        return ResponseDTO.builder()
                .id(response.getId())
                .questionId(response.getQuestionId())
                .studentId(response.getStudentId())
                .enrollmentId(response.getEnrollmentId())
                .answerText(response.getAnswerText())
                .isCorrect(response.getIsCorrect())
                .pointsEarned(response.getPointsEarned())
                .attemptNumber(response.getAttemptNumber())
                .timeSpentSeconds(response.getTimeSpentSeconds())
                .submittedAt(response.getSubmittedAt())
                .build();
    }
    
    /**
     * Convert from DTO to entity.
     */
    public Response toEntity() {
        return Response.builder()
                .id(this.id)
                .questionId(this.questionId)
                .studentId(this.studentId)
                .enrollmentId(this.enrollmentId)
                .answerText(this.answerText)
                .isCorrect(this.isCorrect)
                .pointsEarned(this.pointsEarned)
                .attemptNumber(this.attemptNumber)
                .timeSpentSeconds(this.timeSpentSeconds)
                .build();
    }
}
