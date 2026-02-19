package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * CourseEnrollment entity representing a student's enrollment in a course.
 */
@Entity
@Table(name = "course_enrollments", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"course_id", "student_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEnrollment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "course_id", nullable = false)
    private Long courseId;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @CreationTimestamp
    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;
    
    @Column(name = "completion_percentage", precision = 5, scale = 2)
    private BigDecimal completionPercentage;
    
    @Column(name = "status", length = 50)
    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;
    
    @Column(name = "final_grade", precision = 5, scale = 2)
    private BigDecimal finalGrade;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Enrollment status enumeration.
     */
    public enum EnrollmentStatus {
        ACTIVE,
        COMPLETED,
        DROPPED,
        SUSPENDED,
        IN_PROGRESS
    }
}
