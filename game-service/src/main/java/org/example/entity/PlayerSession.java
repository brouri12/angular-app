package org.example.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Tracks a player's active session: lives, level, progress bar.
 */
@Entity
@Table(name = "player_session", indexes = {
    @Index(name = "idx_ps_user_id", columnList = "user_id", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true, length = 255)
    private String userId;

    @Column(nullable = false)
    @Builder.Default
    private Integer lives = 3;

    @Column(nullable = false)
    @Builder.Default
    private Integer level = 1;

    /** 0-100 progress within the current level */
    @Column(nullable = false)
    @Builder.Default
    private Integer progressBar = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer gamesWon = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer gamesLost = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalGamesPlayed = 0;

    /** Total XP earned across all games */
    @Column(nullable = false)
    @Builder.Default
    private Integer totalXP = 0;

    /** Current win streak (consecutive wins) */
    @Column(nullable = false)
    @Builder.Default
    private Integer winStreak = 0;

    /** Best win streak ever achieved */
    @Column(nullable = false)
    @Builder.Default
    private Integer bestStreak = 0;

    /** Total stars earned across all games */
    @Column(nullable = false)
    @Builder.Default
    private Integer totalStars = 0;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
