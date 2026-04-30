package com.elearning.formation.entity;

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
    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;
    
    @Column(name = "completion_percentage", precision = 5, scale = 2)
    private BigDecimal completionPercentage;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private EnrollmentStatus status;
    
    @Column(name = "final_grade", precision = 5, scale = 2)
    private BigDecimal finalGrade;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
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
    
    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = EnrollmentStatus.ACTIVE;
        }
        if (completionPercentage == null) {
            completionPercentage = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (completionPercentage != null && completionPercentage.compareTo(BigDecimal.valueOf(100)) >= 0) {
            status = EnrollmentStatus.COMPLETED;
        }
    }
}
