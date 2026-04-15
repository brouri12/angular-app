package com.gestions.ramzi.servicefeedback.entities;

/**
 * Catégories de réclamations pour la classification automatique
 */
public enum CategorieReclamation {
    TECHNIQUE("Technique", "🔧"),
    FACTURATION("Facturation", "💳"),
    QUALITE("Qualité", "⭐"),
    ADMINISTRATIF("Administratif", "📋"),
    AUTRE("Autre", "📌");

    private final String libelle;
    private final String emoji;

    CategorieReclamation(String libelle, String emoji) {
        this.libelle = libelle;
        this.emoji = emoji;
    }

    public String getLibelle() {
        return libelle;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getDisplayName() {
        return emoji + " " + libelle;
    }

    /**
     * Convertir une chaîne en CategorieReclamation
     */
    public static CategorieReclamation fromString(String value) {
        if (value == null) {
            return AUTRE;
        }
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return AUTRE;
        }
    }
}

