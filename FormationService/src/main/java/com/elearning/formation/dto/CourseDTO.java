package com.elearning.formation.dto;

import com.elearning.formation.entity.Course;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Course.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDTO {
    
    private Long id;
    
    @NotBlank(message = "Course code is required")
    @Size(min = 3, max = 20, message = "Course code must be between 3 and 20 characters")
    private String courseCode;
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;
    
    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;
    
    private Long teacherId;
    
    @Min(value = 1, message = "Duration must be at least 1 hour")
    @Max(value = 1000, message = "Duration cannot exceed 1000 hours")
    private Integer durationHours;
    
    @DecimalMin(value = "0.0", message = "Price must be positive")
    @DecimalMax(value = "999999.99", message = "Price cannot exceed 999999.99")
    private BigDecimal price;
    
    @Min(value = 1, message = "Max students must be at least 1")
    @Max(value = 10000, message = "Max students cannot exceed 10000")
    private Integer maxStudents;
    
    private Course.CourseLevel level;
    
    private Course.CourseStatus status;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Additional fields for responses
    private Long enrollmentCount;
    private Double averageRating;
    private Integer availableSlots;
    
    /**
     * Convert from entity to DTO.
     */
    public static CourseDTO fromEntity(Course course) {
        return CourseDTO.builder()
                .id(course.getId())
                .courseCode(course.getCourseCode())
                .title(course.getTitle())
                .description(course.getDescription())
                .teacherId(course.getTeacherId())
                .durationHours(course.getDurationHours())
                .price(course.getPrice())
                .maxStudents(course.getMaxStudents())
                .level(course.getLevel())
                .status(course.getStatus())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert from DTO to entity.
     */
    public Course toEntity() {
        return Course.builder()
                .id(this.id)
                .courseCode(this.courseCode)
                .title(this.title)
                .description(this.description)
                .teacherId(this.teacherId)
                .durationHours(this.durationHours)
                .price(this.price)
                .maxStudents(this.maxStudents)
                .level(this.level)
                .status(this.status)
                .build();
    }
}
