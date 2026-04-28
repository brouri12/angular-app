package com.gestions.ramzi.servicepronunciation.dto;

import com.gestions.ramzi.servicepronunciation.enums.BadgeType;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO Progression utilisateur
 */
@Value
@Builder
public class ProgressDTO {
    Long userId;
    Double globalAverageScore;
    Map<NiveauCECRL, Double> scoresByNiveau;
    Integer totalChallengesCompleted;
    Integer totalRecordings;
    Integer currentStreak;
    Integer bestStreak;
    List<String> weakPhonemes;
    List<BadgeType> badges;
    NiveauCECRL estimatedLevel;
    LocalDateTime lastActivityDate;
    Integer xp;
}
