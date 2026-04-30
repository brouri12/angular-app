package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chapter_id", nullable = false)
    private Long chapterId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "passing_score_percent", nullable = false)
    private Integer passingScorePercent;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "min_delay_minutes_between_attempts")
    private Integer minDelayMinutesBetweenAttempts;

    @Column(name = "require_chapter_lessons_completed", nullable = false)
    private Boolean requireChapterLessonsCompleted;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (passingScorePercent == null) passingScorePercent = 50;
        if (requireChapterLessonsCompleted == null) requireChapterLessonsCompleted = true;
    }
}
