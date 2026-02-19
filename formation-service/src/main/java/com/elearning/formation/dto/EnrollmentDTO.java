package com.elearning.formation.dto;

import com.elearning.formation.entity.CourseEnrollment;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for CourseEnrollment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDTO {
    
    private Long id;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    private LocalDate enrollmentDate;
    
    @DecimalMin(value = "0.0", message = "Completion percentage must be positive")
    @DecimalMax(value = "100.0", message = "Completion percentage cannot exceed 100")
    private BigDecimal completionPercentage;
    
    private CourseEnrollment.EnrollmentStatus status;
    
    @DecimalMin(value = "0.0", message = "Final grade must be positive")
    @DecimalMax(value = "100.0", message = "Final grade cannot exceed 100")
    private BigDecimal finalGrade;
    
    // Additional fields for responses
    private String courseTitle;
    private String courseCode;
    private String studentName;
    private Integer daysSinceEnrollment;
    private BigDecimal predictedDropoutRisk;
    private Boolean hasAbnormalProgress;
    
    /**
     * Convert from entity to DTO.
     */
    public static EnrollmentDTO fromEntity(CourseEnrollment enrollment) {
        return EnrollmentDTO.builder()
                .id(enrollment.getId())
                .courseId(enrollment.getCourseId())
                .studentId(enrollment.getStudentId())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .completionPercentage(enrollment.getCompletionPercentage())
                .status(enrollment.getStatus())
                .finalGrade(enrollment.getFinalGrade())
                .build();
    }
    
    /**
     * Convert from DTO to entity.
     */
    public CourseEnrollment toEntity() {
        return CourseEnrollment.builder()
                .id(this.id)
                .courseId(this.courseId)
                .studentId(this.studentId)
                .completionPercentage(this.completionPercentage)
                .status(this.status)
                .finalGrade(this.finalGrade)
                .build();
    }
}
