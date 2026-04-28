package com.gestions.ramzi.servicefeedback.entities;

/**
 * Énumération des niveaux de priorité pour les réclamations
 */
public enum Priorite {
    CRITIQUE("🔴", "Critique"),
    HAUTE("🟠", "Haute"),
    MOYENNE("🟡", "Moyenne"),
    BASSE("🟢", "Basse");

    private final String emoji;
    private final String libelle;

    Priorite(String emoji, String libelle) {
        this.emoji = emoji;
        this.libelle = libelle;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getLibelle() {
        return libelle;
    }

    /**
     * Retourne lePriorite à partir d'une chaîne de caractères
     */
    public static Priorite fromString(String value) {
        if (value == null || value.isBlank()) {
            return MOYENNE; // Valeur par défaut
        }
        try {
            return Priorite.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return MOYENNE;
        }
    }
}
