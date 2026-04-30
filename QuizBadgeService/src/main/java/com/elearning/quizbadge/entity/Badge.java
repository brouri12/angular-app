package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;

/**
 * Badge entity representing achievement badges for students.
 */
@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "student_id", nullable = false)
    private Long studentId;
    
    @Column(name = "badge_name", nullable = false, length = 100)
    private String badgeName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "badge_type", nullable = false, length = 50)
    private BadgeType badgeType;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "icon_url", length = 200)
    private String iconUrl;
    
    @Column(name = "course_id")
    private Long courseId;
    
    @Column(name = "question_id")
    private Long questionId;
    
    @Column(name = "criteria_met", length = 200)
    private String criteriaMet;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "badge_level", nullable = false, length = 20)
    private BadgeLevel badgeLevel;
    
    @Column(name = "earned_date", nullable = false)
    private LocalDate earnedDate;
    
    /**
     * Badge type enumeration.
     */
    public enum BadgeType {
        COURSE_COMPLETION,
        QUIZ_MASTER,
        PERFECT_SCORE,
        SPEED_STAR,
        STREAK,
        EXPERT,
        FIRST_ATTEMPT,
        TOP_STUDENT
    }
    
    /**
     * Badge level enumeration.
     */
    public enum BadgeLevel {
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM,
        DIAMOND
    }
    
    @PrePersist
    protected void onCreate() {
        if (earnedDate == null) {
            earnedDate = LocalDate.now();
        }
        if (badgeLevel == null) {
            badgeLevel = BadgeLevel.BRONZE;
        }
    }
}
