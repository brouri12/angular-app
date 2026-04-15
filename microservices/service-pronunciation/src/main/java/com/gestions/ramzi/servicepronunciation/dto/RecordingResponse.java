package com.gestions.ramzi.servicepronunciation.dto;

import com.gestions.ramzi.servicepronunciation.enums.RecordingStatus;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO pour UserRecording
 */
public record RecordingResponse(
    Long id,
    Long challengeId,
    String challengePhrase,
    Long userId,
    String audioUrl,
    Double overallScore,
    Double pronunciationScore,
    Double fluencyScore,
    Double intonationScore,
    Double clarityScore,
    String aiFeedback,
    List<String> problematicPhonemes,
    LocalDateTime submittedAt,
    LocalDateTime evaluatedAt,
    RecordingStatus status,
    Integer attemptNumber
) {}

