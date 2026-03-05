package tn.esprit.challenge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.SkillFocus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChallengeType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillFocus skillFocus;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProficiencyLevel level;
    
    private String category; // e.g., "Tenses", "Vocabulary", "Idioms"
    
    @Column(nullable = false)
    private Integer points = 0;
    
    private Integer timeLimit; // In minutes (null = no time limit)
    
    @Column(columnDefinition = "TEXT")
    private String content; // Main content (passage, instructions, etc.)
    
    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();
    
    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Hint> hints = new ArrayList<>();
    
    private Long createdBy; // User ID of creator (teacher/admin)
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @Column(nullable = false)
    private Boolean isPublic = true; // Public or course-specific
    
    private String tags; // Comma-separated tags
    
    private Double averageRating = 0.0;
    
    private Integer totalAttempts = 0;
    
    private Integer successfulCompletions = 0;
    
    private String audioUrl; // For listening challenges
    
    private String imageUrl; // For visual challenges
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper method to calculate success rate
    public Double getSuccessRate() {
        if (totalAttempts == 0) return 0.0;
        return (successfulCompletions.doubleValue() / totalAttempts) * 100;
    }
}
