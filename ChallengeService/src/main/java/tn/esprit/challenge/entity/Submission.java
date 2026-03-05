package tn.esprit.challenge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.challenge.enums.SubmissionStatus;

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
    private Long challengeId;
    
    @Column(nullable = false)
    private Long userId;
    
    @ElementCollection
    @CollectionTable(name = "submission_answers", joinColumns = @JoinColumn(name = "submission_id"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "answer")
    private Map<Long, String> answers = new HashMap<>(); // QuestionId -> Answer
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;
    
    @Column(nullable = false)
    private Integer score = 0;
    
    private Integer correctAnswers = 0;
    
    private Integer totalQuestions = 0;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;
    
    private Long completionTime; // In seconds
    
    @Column(columnDefinition = "TEXT")
    private String feedback; // Auto-generated or teacher feedback
    
    private Integer hintsUsed = 0;
    
    // For writing/speaking challenges
    @Column(columnDefinition = "TEXT")
    private String writtenResponse;
    
    private String audioResponseUrl;
    
    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;
    
    @Column(nullable = false)
    private Boolean requiresManualGrading = false;
    
    private LocalDateTime gradedAt;
    
    private Long gradedBy; // Teacher ID who graded
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
    
    // Helper method to calculate percentage
    public Double getPercentage() {
        if (totalQuestions == 0) return 0.0;
        return (correctAnswers.doubleValue() / totalQuestions) * 100;
    }
}
