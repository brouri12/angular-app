package tn.esprit.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionDTO {

    private Long    userId;
    private Long    challengeId;
    private String  challengeTitle;
    private String  challengeType;
    private String  challengeLevel;

    /** Predicted probability of passing (0–100) */
    private Double  successProbability;

    /** HIGH / MEDIUM / LOW — confidence in the prediction */
    private String  confidence;

    // ── Breakdown factors ──────────────────────────────────────────────────────
    private Double  userOverallPassRate;
    private Double  userTypePassRate;
    private Double  userLevelPassRate;
    private Double  challengeGlobalPassRate;
    private Integer currentStreak;
    private Integer totalSubmissions;

    /** Human-readable advice based on the prediction */
    private String  advice;
}
