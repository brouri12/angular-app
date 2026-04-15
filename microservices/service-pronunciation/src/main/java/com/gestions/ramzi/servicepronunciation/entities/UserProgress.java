package com.gestions.ramzi.servicepronunciation.entities;

import com.gestions.ramzi.servicepronunciation.enums.BadgeType;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité représentant la progression d'un utilisateur en prononciation
 */
@Entity
@Table(name = "user_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;  // Référence vers l'utilisateur via service-user

    // Scores moyens par niveau CECRL
    @Column(precision = 5)
    @Builder.Default
    private Double averageScoreA1 = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double averageScoreA2 = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double averageScoreB1 = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double averageScoreB2 = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double averageScoreC1 = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double averageScoreC2 = 0.0;

    // Score global
    @Column(precision = 5)
    @Builder.Default
    private Double globalAverageScore = 0.0;

    // Total des défis complétés
    @Builder.Default
    private Integer totalChallengesCompleted = 0;

    // Total des enregistrements
    @Builder.Default
    private Integer totalRecordings = 0;

    // Série actuelle (jours consécutifs)
    @Builder.Default
    private Integer currentStreak = 0;

    // Meilleure série
    @Builder.Default
    private Integer bestStreak = 0;

    // Dernière date d'activité
    private LocalDateTime lastActivityDate;

    // Phonèmes à travailler (calculés par l'IA)
    @ElementCollection
    @CollectionTable(name = "user_weak_phonemes", joinColumns = @JoinColumn(name = "user_progress_id"))
    @Column(name = "phoneme")
    private List<String> weakPhonemes;

    @ElementCollection
    @CollectionTable(name = "user_earned_badges", joinColumns = @JoinColumn(name = "user_progress_id"))
    @Column(name = "badge")
    @Enumerated(EnumType.STRING)
    private List<BadgeType> earnedBadges;

    @Builder.Default
    private Integer xp = 0;

    // Niveau actuel estimé
    @Enumerated(EnumType.STRING)
    private NiveauCECRL estimatedLevel;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastActivityDate = LocalDateTime.now();
    }
}
