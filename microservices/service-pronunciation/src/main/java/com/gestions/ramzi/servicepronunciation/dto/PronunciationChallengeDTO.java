package com.gestions.ramzi.servicepronunciation.dto;

import com.gestions.ramzi.servicepronunciation.enums.ChallengeType;
import com.gestions.ramzi.servicepronunciation.enums.DifficultyLevel;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTO pour création/mise à jour de PronunciationChallenge
 */
public record PronunciationChallengeDTO(
    
    @NotBlank(message = "Phrase obligatoire")
    String phrase,
    
    @NotNull(message = "Niveau CECRL obligatoire")
    NiveauCECRL niveau,
    
    @NotNull(message = "Type de défi obligatoire")
    ChallengeType type,
    
    String description,
    
    String phoneticTranscription,
    
    String audioReferenceUrl,
    
    List<String> keywords,
    
    String tips,
    
    DifficultyLevel difficulty
) {}
