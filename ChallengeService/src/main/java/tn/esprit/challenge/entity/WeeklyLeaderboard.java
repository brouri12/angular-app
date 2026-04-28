package tn.esprit.challenge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Snapshot of the weekly leaderboard.
 * Created every Monday before the leaderboard resets.
 * Allows browsing historical "champion of the week" data.
 */
@Entity
@Table(name = "weekly_leaderboard",
       indexes = @Index(name = "idx_wl_week", columnList = "weekStart"))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyLeaderboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Monday of the week this snapshot covers */
    @Column(nullable = false)
    private LocalDate weekStart;

    /** Sunday of the week this snapshot covers */
    @Column(nullable = false)
    private LocalDate weekEnd;

    @Column(nullable = false)
    private Integer rank;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Integer totalScore;

    @Column(nullable = false)
    private Integer challengesPassed;

    @Column(nullable = false)
    private Double passRate;

    @Column(nullable = false)
    private Double averageAccuracy;
}
