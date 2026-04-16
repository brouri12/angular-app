package org.example.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long gameId;

    @Column(nullable = false)
    private String userId;

    @ElementCollection
    @CollectionTable(name = "submission_answers",
        joinColumns = @JoinColumn(name = "submission_id"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "answer")
    private Map<Long, String> answers = new HashMap<>();

    @Column(nullable = false, length = 20)
    private String status = "PENDING";  // PASSED, PARTIAL, FAILED

    @Column(nullable = false)
    private Integer score = 0;

    private Integer correctAnswers = 0;

    private Integer totalQuestions = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    private Long completionTime;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }

    public Double getPercentage() {
        if (totalQuestions == null || totalQuestions == 0) return 0.0;
        return (correctAnswers.doubleValue() / totalQuestions) * 100;
    }
}
