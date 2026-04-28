package com.gestions.ramzi.servicepronunciation.dto;

import java.util.List;
import java.util.Map;

/**
 * Résultat analyse audio IA
 */
public record AudioAnalysisResult(
    String transcription,          // Texte transcrit
    Double pronunciationScore,     // Score prononciation 0-100
    Double fluencyScore,           // Score fluidité
    Double intonationScore,        // Score intonation
    Double clarityScore,           // Score clarté
    String overallFeedback,        // Feedback global
    List<String> problematicPhonemes, // Phonèmes problématiques
    List<String> improvementTips,  // Conseils amélioration
    Map<String, Double> detailedScores, // Scores détaillés
    Double confidence              // Confiance IA
) {}
