package com.gestions.ramzi.servicepronunciation.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gestions.ramzi.servicepronunciation.enums.RecordingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité représentant un enregistrement vocal d'un étudiant
 */
@Entity
@Table(name = "user_recordings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRecording {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)

    @JoinColumn(name = "challenge_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private PronunciationChallenge challenge;

    @Column(name = "user_id", nullable = false)
    private Long userId;  // Référence vers l'utilisateur via service-user

    @Column(nullable = false, length = 500)
    private String audioUrl;  // Chemin du fichier audio

    @Column(length = 500)
    private String audioStoragePath;  // Chemin de stockage interne

    // Scores détaillés (par l'IA)
    @Column(precision = 5)
    @Builder.Default
    private Double overallScore = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double pronunciationScore = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double fluencyScore = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double intonationScore = 0.0;

    @Column(precision = 5)
    @Builder.Default
    private Double clarityScore = 0.0;

    @Column(length = 2000)
    private String aiFeedback;  // Feedback IA détaillé

    @Column(length = 1000)
    private String improvementTips;  // Conseils d'amélioration

    @ElementCollection
    @CollectionTable(
            name = "recording_problematic_phonemes",
            joinColumns = @JoinColumn(name = "recording_id")
    )
    @Column(name = "phoneme", length = 10)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.VARCHAR)  // optional
    private List<String> problematicPhonemes;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime evaluatedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecordingStatus status = RecordingStatus.PENDING;

    // Durée de l'enregistrement en secondes
    private Integer durationSeconds;

    // Nombre de tentatives pour ce défi
    @Builder.Default
    private Integer attemptNumber = 1;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}

