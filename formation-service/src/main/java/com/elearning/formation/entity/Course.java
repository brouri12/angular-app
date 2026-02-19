package com.elearning.formation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Course entity representing a course in the e-learning platform.
 */
@Entity
@Table(name = "courses", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"course_code"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;
    
    @Column(name = "duration_hours", nullable = false)
    private Integer durationHours;
    
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "max_students", nullable = false)
    private Integer maxStudents;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 20)
    private CourseLevel level;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CourseStatus status;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * Course level enumeration.
     */
    public enum CourseLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
    
    /**
     * Course status enumeration.
     */
    public enum CourseStatus {
        DRAFT,
        PUBLISHED,
        ACTIVE,
        COMPLETED,
        ARCHIVED,
        CANCELLED
    }
    
    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = CourseStatus.DRAFT;
        }
        if (level == null) {
            level = CourseLevel.BEGINNER;
        }
    }
}
