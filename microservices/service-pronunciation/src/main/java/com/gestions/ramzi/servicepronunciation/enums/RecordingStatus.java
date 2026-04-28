package com.gestions.ramzi.servicepronunciation.enums;

/**
 * Statut d'un enregistrement vocal
 */
public enum RecordingStatus {
    PENDING,      // En attente de traitement
    PROCESSING,   // En cours d'analyse IA
    COMPLETED,    // Analyse terminée
    FAILED        // Échec de l'analyse
}

