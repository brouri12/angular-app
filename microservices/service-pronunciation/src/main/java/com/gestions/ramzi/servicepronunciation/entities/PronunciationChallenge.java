package com.gestions.ramzi.servicepronunciation.entities;

import com.gestions.ramzi.servicepronunciation.enums.ChallengeType;
import com.gestions.ramzi.servicepronunciation.enums.DifficultyLevel;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité représentant un défi de prononciation
 */
@Entity
@Table(name = "pronunciation_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PronunciationChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String phrase;  // Phrase ou mot à prononcer

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NiveauCECRL niveau;  // A1, A2, B1, B2, C1, C2

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChallengeType type;  // MOT, PHRASE, DIALOGUE, etc.

    @Column(length = 500)
    private String description;  // Contexte d'utilisation

    @Column(length = 2000)
    private String phoneticTranscription;  // Transcription phonétique

    @Column(length = 500)
    private String audioReferenceUrl;  // Audio de référence (native speaker)

    @ElementCollection
    @CollectionTable(name = "challenge_keywords", joinColumns = @JoinColumn(name = "challenge_id"))
    @Column(name = "keyword")
    private List<String> keywords;  // Mots-clés pour filtrage

    @Column(nullable = false)
    private LocalDateTime datePosted;

    @Column(nullable = false)
    @Builder.Default
    private Boolean actif = true;

    // Métadonnées pour l'IA
    @Column(length = 1000)
    private String tips;  // Conseils pour la prononciation

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DifficultyLevel difficulty = DifficultyLevel.MEDIUM;

    // Statistiques
    @Builder.Default
    private Integer totalSubmissions = 0;

    @Column(precision = 5)
    @Builder.Default
    private Double averageScore = 0.0;

    @PrePersist
    protected void onCreate() {
        if (datePosted == null) {
            datePosted = LocalDateTime.now();
        }
    }
}

