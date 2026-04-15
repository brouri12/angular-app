package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.entities.Sentiment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Service d'analyse de sentiment avancé
 * Utilise la pondération des mots et des expressions pour une détection plus précise
 */
@Service
public class SentimentAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(SentimentAnalysisService.class);

    // ========================
    // MOTS POSITIFS AVEC POIDS (Français)
    // ========================
    private static final Map<String, Integer> MOTS_POSITIFS_FR = new HashMap<>();
    static {
        // Intensité forte (poids = 3)
        MOTS_POSITIFS_FR.put("excellent", 3);
        MOTS_POSITIFS_FR.put("extraordinaire", 3);
        MOTS_POSITIFS_FR.put("fantastique", 3);
        MOTS_POSITIFS_FR.put("merveilleux", 3);
        MOTS_POSITIFS_FR.put("parfait", 3);
        MOTS_POSITIFS_FR.put("incroyable", 3);
        
        // Intensité moyenne (poids = 2)
        MOTS_POSITIFS_FR.put("super", 2);
        MOTS_POSITIFS_FR.put("génial", 2);
        MOTS_POSITIFS_FR.put("magnifique", 2);
        MOTS_POSITIFS_FR.put("formidable", 2);
        MOTS_POSITIFS_FR.put("superbe", 2);
        MOTS_POSITIFS_FR.put("bravo", 2);
        MOTS_POSITIFS_FR.put("adore", 2);
        MOTS_POSITIFS_FR.put("recommande", 2);
        MOTS_POSITIFS_FR.put("satisfait", 2);
        MOTS_POSITIFS_FR.put("ravi", 2);
        MOTS_POSITIFS_FR.put("content", 2);
        
        // Intensité faible (poids = 1)
        MOTS_POSITIFS_FR.put("bien", 1);
        MOTS_POSITIFS_FR.put("bon", 1);
        MOTS_POSITIFS_FR.put("aime", 1);
        MOTS_POSITIFS_FR.put("correct", 1);
        MOTS_POSITIFS_FR.put("adequate", 1);
    }

    // ========================
    // MOTS POSITIFS AVEC POIDS (Anglais)
    // ========================
    private static final Map<String, Integer> MOTS_POSITIFS_EN = new HashMap<>();
    static {
        // Intensité forte (poids = 3)
        MOTS_POSITIFS_EN.put("excellent", 3);
        MOTS_POSITIFS_EN.put("amazing", 3);
        MOTS_POSITIFS_EN.put("awesome", 3);
        MOTS_POSITIFS_EN.put("fantastic", 3);
        MOTS_POSITIFS_EN.put("wonderful", 3);
        MOTS_POSITIFS_EN.put("perfect", 3);
        MOTS_POSITIFS_EN.put("outstanding", 3);
        MOTS_POSITIFS_EN.put("brilliant", 3);
        MOTS_POSITIFS_EN.put("exceptional", 3);
        MOTS_POSITIFS_EN.put("phenomenal", 3);
        
        // Intensité moyenne (poids = 2)
        MOTS_POSITIFS_EN.put("great", 2);
        MOTS_POSITIFS_EN.put("love", 2);
        MOTS_POSITIFS_EN.put("loved", 2);
        MOTS_POSITIFS_EN.put("recommend", 2);
        MOTS_POSITIFS_EN.put("recommendation", 2);
        MOTS_POSITIFS_EN.put("satisfied", 2);
        MOTS_POSITIFS_EN.put("pleased", 2);
        MOTS_POSITIFS_EN.put("happy", 2);
        MOTS_POSITIFS_EN.put("impressive", 2);
        MOTS_POSITIFS_EN.put("professional", 2);
        MOTS_POSITIFS_EN.put("knowledgeable", 2);
        MOTS_POSITIFS_EN.put("helpful", 2);
        MOTS_POSITIFS_EN.put("useful", 2);
        MOTS_POSITIFS_EN.put("informative", 2);
        MOTS_POSITIFS_EN.put("engaging", 2);
        MOTS_POSITIFS_EN.put("inspiring", 2);
        
        // Intensité faible (poids = 1)
        MOTS_POSITIFS_EN.put("good", 1);
        MOTS_POSITIFS_EN.put("best", 1);
        MOTS_POSITIFS_EN.put("better", 1);
        MOTS_POSITIFS_EN.put("nice", 1);
        MOTS_POSITIFS_EN.put("enjoyable", 1);
        MOTS_POSITIFS_EN.put("valuable", 1);
        MOTS_POSITIFS_EN.put("clear", 1);
        MOTS_POSITIFS_EN.put("organized", 1);
    };

    // ========================
    // MOTS NÉGATIFS AVEC POIDS (Français)
    // ========================
    private static final Map<String, Integer> MOTS_NEGATIFS_FR = new HashMap<>();
    static {
        // Intensité forte (poids = 3)
        MOTS_NEGATIFS_FR.put("catastrophe", 3);
        MOTS_NEGATIFS_FR.put("nul", 3);
        MOTS_NEGATIFS_FR.put("horrible", 3);
        MOTS_NEGATIFS_FR.put("terrible", 3);
        MOTS_NEGATIFS_FR.put("dégoutant", 3);
        MOTS_NEGATIFS_FR.put("insupportable", 3);
        
        // Intensité moyenne (poids = 2)
        MOTS_NEGATIFS_FR.put("mauvais", 2);
        MOTS_NEGATIFS_FR.put("décevant", 2);
        MOTS_NEGATIFS_FR.put("déçu", 2);
        MOTS_NEGATIFS_FR.put("frustré", 2);
        MOTS_NEGATIFS_FR.put("fâché", 2);
        MOTS_NEGATIFS_FR.put("problème", 2);
        MOTS_NEGATIFS_FR.put("bug", 2);
        MOTS_NEGATIFS_FR.put("erreur", 2);
        MOTS_NEGATIFS_FR.put("dommage", 2);
        
        // Intensité faible (poids = 1)
        MOTS_NEGATIFS_FR.put("pire", 1);
        MOTS_NEGATIFS_FR.put("inutile", 1);
        MOTS_NEGATIFS_FR.put("grave", 1);
        MOTS_NEGATIFS_FR.put("affreux", 1);
    };

    // ========================
    // MOTS NÉGATIFS AVEC POIDS (Anglais)
    // ========================
    private static final Map<String, Integer> MOTS_NEGATIFS_EN = new HashMap<>();
    static {
        // Intensité forte (poids = 3)
        MOTS_NEGATIFS_EN.put("terrible", 3);
        MOTS_NEGATIFS_EN.put("horrible", 3);
        MOTS_NEGATIFS_EN.put("awful", 3);
        MOTS_NEGATIFS_EN.put("worst", 3);
        MOTS_NEGATIFS_EN.put("nightmare", 3);
        MOTS_NEGATIFS_EN.put("disaster", 3);
        MOTS_NEGATIFS_EN.put("disgusting", 3);
        
        // Intensité moyenne (poids = 2)
        MOTS_NEGATIFS_EN.put("bad", 2);
        MOTS_NEGATIFS_EN.put("poor", 2);
        MOTS_NEGATIFS_EN.put("disappointed", 2);
        MOTS_NEGATIFS_EN.put("disappointing", 2);
        MOTS_NEGATIFS_EN.put("hate", 2);
        MOTS_NEGATIFS_EN.put("hated", 2);
        MOTS_NEGATIFS_EN.put("useless", 2);
        MOTS_NEGATIFS_EN.put("worthless", 2);
        MOTS_NEGATIFS_EN.put("boring", 2);
        MOTS_NEGATIFS_EN.put("bored", 2);
        MOTS_NEGATIFS_EN.put("confusing", 2);
        MOTS_NEGATIFS_EN.put("confused", 2);
        MOTS_NEGATIFS_EN.put("frustrating", 2);
        MOTS_NEGATIFS_EN.put("frustrated", 2);
        MOTS_NEGATIFS_EN.put("annoying", 2);
        MOTS_NEGATIFS_EN.put("unprofessional", 2);
        MOTS_NEGATIFS_EN.put("incompetent", 2);
        MOTS_NEGATIFS_EN.put("broken", 2);
        
        // Intensité faible (poids = 1)
        MOTS_NEGATIFS_EN.put("worse", 1);
        MOTS_NEGATIFS_EN.put("dislike", 1);
        MOTS_NEGATIFS_EN.put("unclear", 1);
        MOTS_NEGATIFS_EN.put("unorganized", 1);
        MOTS_NEGATIFS_EN.put("messy", 1);
        MOTS_NEGATIFS_EN.put("error", 1);
        MOTS_NEGATIFS_EN.put("mistake", 1);
        MOTS_NEGATIFS_EN.put("avoid", 1);
    };

    // ========================
    // EXPRESSIONS COMPOSÉES (Bigrams)
    // ========================
    private static final Map<String, Integer> EXPRESSIONS_POSITIVES = new HashMap<>();
    static {
        EXPRESSIONS_POSITIVES.put("well done", 3);
        EXPRESSIONS_POSITIVES.put("good job", 3);
        EXPRESSIONS_POSITIVES.put("highly recommend", 3);
        EXPRESSIONS_POSITIVES.put("thumbs up", 3);
        EXPRESSIONS_POSITIVES.put("top notch", 3);
        EXPRESSIONS_POSITIVES.put("world class", 3);
        EXPRESSIONS_POSITIVES.put("very good", 2);
        EXPRESSIONS_POSITIVES.put("very helpful", 2);
        EXPRESSIONS_POSITIVES.put("very useful", 2);
    };

    private static final Map<String, Integer> EXPRESSIONS_NEGATIVES = new HashMap<>();
    static {
        EXPRESSIONS_NEGATIVES.put("waste of time", 3);
        EXPRESSIONS_NEGATIVES.put("worst ever", 3);
        EXPRESSIONS_NEGATIVES.put("never again", 3);
        EXPRESSIONS_NEGATIVES.put("not recommend", 3);
        EXPRESSIONS_NEGATIVES.put("very bad", 2);
        EXPRESSIONS_NEGATIVES.put("very poor", 2);
    };

    /**
     * Analyse le commentaire avec la note pour une détection précise
     * @param commentaire Le commentaire à analyser
     * @param note La note du feedback (1-5), peut être null
     * @return Sentiment (POSITIF, NEUTRE ou NEGATIF)
     */
    public Sentiment analyzeWithNote(String commentaire, Integer note) {
        logger.info("=== Début analyse sentiment ===");
        logger.info("Commentaire: {}", commentaire);
        logger.info("Note: {}", note);

        // Si pas de commentaire, utiliser uniquement la note
        if (commentaire == null || commentaire.isBlank()) {
            logger.info("Commentaire vide, utilisation de la note uniquement");
            return analyzeByNote(note);
        }

        String lowerComment = commentaire.toLowerCase();

        // Calculer le score basé sur les mots
        int scorePositif = 0;
        int scoreNegatif = 0;

        // 1. Vérifier les expressions composées (priorité haute)
        logger.info("--- Vérification expressions composées ---");
        for (Map.Entry<String, Integer> expr : EXPRESSIONS_POSITIVES.entrySet()) {
            if (lowerComment.contains(expr.getKey())) {
                scorePositif += expr.getValue();
                logger.info("Expression positive détectée: {} (poids: {})", expr.getKey(), expr.getValue());
            }
        }
        for (Map.Entry<String, Integer> expr : EXPRESSIONS_NEGATIVES.entrySet()) {
            if (lowerComment.contains(expr.getKey())) {
                scoreNegatif += expr.getValue();
                logger.info("Expression négative détectée: {} (poids: {})", expr.getKey(), expr.getValue());
            }
        }

        // 2. Vérifier les mots positifs (Français)
        logger.info("--- Vérification mots positifs FR ---");
        for (Map.Entry<String, Integer> entry : MOTS_POSITIFS_FR.entrySet()) {
            if (lowerComment.contains(entry.getKey())) {
                scorePositif += entry.getValue();
                logger.info("Mot positif FR détecté: {} (poids: {})", entry.getKey(), entry.getValue());
            }
        }

        // 3. Vérifier les mots positifs (Anglais)
        logger.info("--- Vérification mots positifs EN ---");
        for (Map.Entry<String, Integer> entry : MOTS_POSITIFS_EN.entrySet()) {
            if (lowerComment.contains(entry.getKey())) {
                scorePositif += entry.getValue();
                logger.info("Mot positif EN détecté: {} (poids: {})", entry.getKey(), entry.getValue());
            }
        }

        // 4. Vérifier les mots négatifs (Français)
        logger.info("--- Vérification mots négatifs FR ---");
        for (Map.Entry<String, Integer> entry : MOTS_NEGATIFS_FR.entrySet()) {
            if (lowerComment.contains(entry.getKey())) {
                scoreNegatif += entry.getValue();
                logger.info("Mot négatif FR détecté: {} (poids: {})", entry.getKey(), entry.getValue());
            }
        }

        // 5. Vérifier les mots négatifs (Anglais)
        logger.info("--- Vérification mots négatifs EN ---");
        for (Map.Entry<String, Integer> entry : MOTS_NEGATIFS_EN.entrySet()) {
            if (lowerComment.contains(entry.getKey())) {
                scoreNegatif += entry.getValue();
                logger.info("Mot négatif EN détecté: {} (poids: {})", entry.getKey(), entry.getValue());
            }
        }

        logger.info("Score positif total: {}", scorePositif);
        logger.info("Score négatif total: {}", scoreNegatif);

        // Ajouter le poids de la note si elle est fournie
        if (note != null) {
            if (note >= 4) {
                scorePositif += getNoteWeight(note);
                logger.info("Note {} ajoutée au score positif", note);
            } else if (note <= 2) {
                scoreNegatif += Math.abs(getNoteWeight(note));
                logger.info("Note {} ajoutée au score négatif", note);
            }
        }

        logger.info("Score final - Positif: {}, Négatif: {}", scorePositif, scoreNegatif);

        // Décision finale basée sur les scores
        Sentiment result = determineSentiment(scorePositif, scoreNegatif);
        
        logger.info("=== Résultat: {} ===", result);
        return result;
    }

    /**
     * Calcule le poids de la note
     */
    private int getNoteWeight(Integer note) {
        if (note == null) return 0;
        switch (note) {
            case 5: return 3;  // Très positif
            case 4: return 2;  // Positif
            case 3: return 0;  // Neutre
            case 2: return -2; // Négatif (on n'ajoute pas au négatif, on utilise juste la note comme indicateur)
            case 1: return -3;
            default: return 0;
        }
    }

    /**
     * Analyse basée uniquement sur la note
     */
    private Sentiment analyzeByNote(Integer note) {
        if (note == null) {
            return Sentiment.NEUTRE;
        }
        if (note >= 4) {
            return Sentiment.POSITIF;
        } else if (note <= 2) {
            return Sentiment.NEGATIF;
        }
        return Sentiment.NEUTRE;
    }

    /**
     * Détermine le sentiment final basé sur les scores
     */
    private Sentiment determineSentiment(int scorePositif, int scoreNegatif) {
        // Seuil de différence pour éviter les cas limites
        int difference = scorePositif - scoreNegatif;
        
        // Si les deux scores sont à 0, c'est neutrre
        if (scorePositif == 0 && scoreNegatif == 0) {
            return Sentiment.NEUTRE;
        }
        
        // Si le score positif est significativement plus grand
        if (difference >= 2) {
            return Sentiment.POSITIF;
        }
        
        // Si le score négatif est significativement plus grand
        if (difference <= -2) {
            return Sentiment.NEGATIF;
        }
        
        // Cas limite: scores proches, on retourne Neutre
        return Sentiment.NEUTRE;
    }

    /**
     * Analyse simple (pour compatibilité)
     */
    public Sentiment analyze(String commentaire) {
        return analyzeWithNote(commentaire, null);
    }
}
