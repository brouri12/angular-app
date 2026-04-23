package com.elearning.quizbadge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSession {

    public enum SessionStatus {
        IN_PROGRESS,
        COMPLETED,
        ABANDONED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SessionStatus status;

    @CreationTimestamp
    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "current_step", nullable = false)
    private Integer currentStep;

    @Column(name = "answers_json", columnDefinition = "LONGTEXT")
    private String answersJson;

    @Column(name = "last_error", length = 100)
    private String lastError;

    /** Nombre de fois où l’onglet/page a été masqué (client + agrégation serveur max). */
    @Column(name = "tab_hidden_count")
    private Integer tabHiddenCount;

    /** Tentatives copier/coller/couper bloquées côté client (rapportées au serveur). */
    @Column(name = "clipboard_block_count")
    private Integer clipboardBlockCount;

    /** Nombre de signalements « téléphone détecté » (client / vision). */
    @Column(name = "proctoring_phone_count")
    private Integer proctoringPhoneCount;

    /** Nombre de signalements « plusieurs personnes ». */
    @Column(name = "proctoring_multi_person_count")
    private Integer proctoringMultiPersonCount;

    /** Nombre de signalements « caméra interrompue ». */
    @Column(name = "proctoring_camera_lost_count")
    private Integer proctoringCameraLostCount;

    @Column(name = "proctoring_last_event", length = 64)
    private String proctoringLastEvent;

    @Column(name = "proctoring_last_event_at")
    private LocalDateTime proctoringLastEventAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (status == null) status = SessionStatus.IN_PROGRESS;
        if (durationSeconds == null) durationSeconds = 0;
        if (currentStep == null) currentStep = 0;
        if (answersJson == null) answersJson = "[]";
        if (tabHiddenCount == null) tabHiddenCount = 0;
        if (clipboardBlockCount == null) clipboardBlockCount = 0;
        if (proctoringPhoneCount == null) proctoringPhoneCount = 0;
        if (proctoringMultiPersonCount == null) proctoringMultiPersonCount = 0;
        if (proctoringCameraLostCount == null) proctoringCameraLostCount = 0;
    }
}
