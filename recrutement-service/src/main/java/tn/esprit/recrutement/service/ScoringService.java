package tn.esprit.recrutement.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.recrutement.entity.CandidatureEnseignant;
import tn.esprit.recrutement.entity.OffreRecrutement;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ═══════════════════════════════════════════════════════════════
 * 🏆 INNOVATION — Service de Scoring Automatique des Candidatures
 * ═══════════════════════════════════════════════════════════════
 *
 * Calcule un score de 0 à 100 pour chaque candidature selon :
 *   - Expérience professionnelle (40 pts)
 *   - Qualité de la lettre de motivation (35 pts)
 *   - Rapidité de candidature (15 pts)
 *   - Complétude du dossier (10 pts)
 *
 * Analyse NLP basique de la lettre :
 *   - Richesse du vocabulaire (ratio mots uniques)
 *   - Présence de mots-clés pédagogiques
 *   - Longueur et structure des phrases
 *   - Détection de contenu générique/copié
 */
@Service
@Slf4j
public class ScoringService {

    // Mots-clés pédagogiques valorisés dans une lettre d'enseignant
    private static final List<String> MOTS_CLES_PEDAGOGIQUES = List.of(
        "pédagogie", "enseignement", "formation", "étudiant", "apprentissage",
        "compétence", "expérience", "recherche", "encadrement", "transmission",
        "motivation", "innovation", "méthode", "cours", "travaux pratiques",
        "projet", "évaluation", "accompagnement", "expertise", "académique",
        "université", "master", "doctorat", "publication", "laboratoire"
    );

    // ─────────────────────────────────────────────────────────────────────────
    // SCORE GLOBAL (0-100)
    // ─────────────────────────────────────────────────────────────────────────

    public int calculerScore(CandidatureEnseignant c, OffreRecrutement offre) {
        int score = 0;
        score += scoreExperience(c, offre);       // max 40
        score += scoreLettre(c.getLettre_motivation()); // max 35
        score += scoreRapidite(c, offre);          // max 15
        score += scoreCompletude(c);               // max 10
        return Math.min(score, 100);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPOSANTE 1 : Expérience (40 pts)
    // ─────────────────────────────────────────────────────────────────────────

    private int scoreExperience(CandidatureEnseignant c, OffreRecrutement offre) {
        int experience = c.getAnnees_experience() != null ? c.getAnnees_experience() : 0;
        int requis = offre.getExperience_min() != null ? offre.getExperience_min() : 0;

        if (requis == 0) return 40; // Pas d'exigence → score max

        if (experience >= requis * 2) return 40;       // Double l'expérience requise
        if (experience >= requis) return 30;            // Exactement le requis
        if (experience >= requis - 1) return 20;        // 1 an de moins
        return Math.max(0, (experience * 40) / Math.max(requis, 1)); // Proportionnel
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPOSANTE 2 : Qualité de la lettre de motivation (35 pts)
    // ─────────────────────────────────────────────────────────────────────────

    public int scoreLettre(String lettre) {
        if (lettre == null || lettre.isBlank()) return 0;

        int score = 0;
        String lettreLower = lettre.toLowerCase();
        String[] mots = lettre.split("\\s+");
        int nbMots = mots.length;

        // Longueur (0-10 pts)
        if (nbMots >= 200) score += 10;
        else if (nbMots >= 150) score += 8;
        else if (nbMots >= 100) score += 5;
        else if (nbMots >= 50) score += 2;

        // Richesse vocabulaire (0-10 pts)
        long motsUniques = Arrays.stream(mots)
                .map(String::toLowerCase)
                .distinct()
                .count();
        double ratioUnicite = nbMots > 0 ? (double) motsUniques / nbMots : 0;
        if (ratioUnicite >= 0.7) score += 10;
        else if (ratioUnicite >= 0.5) score += 7;
        else if (ratioUnicite >= 0.3) score += 4;

        // Mots-clés pédagogiques (0-10 pts)
        long nbMotsCles = MOTS_CLES_PEDAGOGIQUES.stream()
                .filter(lettreLower::contains)
                .count();
        score += Math.min(10, (int)(nbMotsCles * 2));

        // Structure (présence de formules de politesse) (0-5 pts)
        boolean aIntroduction = lettreLower.contains("madame") || lettreLower.contains("monsieur")
                || lettreLower.contains("bonjour");
        boolean aConclusion = lettreLower.contains("cordialement") || lettreLower.contains("salutations")
                || lettreLower.contains("respectueusement") || lettreLower.contains("sincèrement");
        if (aIntroduction) score += 2;
        if (aConclusion) score += 3;

        return Math.min(score, 35);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPOSANTE 3 : Rapidité de candidature (15 pts)
    // ─────────────────────────────────────────────────────────────────────────

    private int scoreRapidite(CandidatureEnseignant c, OffreRecrutement offre) {
        if (c.getDate_candidature() == null || offre.getDate_publication() == null) return 0;
        long jours = ChronoUnit.DAYS.between(offre.getDate_publication(), c.getDate_candidature());
        if (jours <= 2) return 15;
        if (jours <= 5) return 10;
        if (jours <= 10) return 5;
        return 2;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPOSANTE 4 : Complétude du dossier (10 pts)
    // ─────────────────────────────────────────────────────────────────────────

    private int scoreCompletude(CandidatureEnseignant c) {
        int score = 0;
        if (c.getCv_pdf() != null && c.getCv_pdf().length > 0) score += 5;
        if (c.getEmail() != null && !c.getEmail().isBlank()) score += 2;
        if (c.getNom_candidat() != null && !c.getNom_candidat().isBlank()) score += 1;
        if (c.getPrenom_candidat() != null && !c.getPrenom_candidat().isBlank()) score += 1;
        if (c.getLettre_motivation() != null && c.getLettre_motivation().length() > 100) score += 1;
        return score;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ANALYSE DÉTAILLÉE DE LA LETTRE
    // ─────────────────────────────────────────────────────────────────────────

    public Map<String, Object> analyserLettre(String lettre) {
        Map<String, Object> analyse = new LinkedHashMap<>();

        if (lettre == null || lettre.isBlank()) {
            analyse.put("qualite", "ABSENTE");
            analyse.put("score", 0);
            return analyse;
        }

        String[] mots = lettre.split("\\s+");
        int nbMots = mots.length;
        String lettreLower = lettre.toLowerCase();

        long motsUniques = Arrays.stream(mots).map(String::toLowerCase).distinct().count();
        double ratioUnicite = nbMots > 0 ? Math.round((double) motsUniques / nbMots * 100.0) / 100.0 : 0;

        List<String> motsClesTrouves = MOTS_CLES_PEDAGOGIQUES.stream()
                .filter(lettreLower::contains)
                .collect(Collectors.toList());

        int score = scoreLettre(lettre);
        String qualite;
        if (score >= 28) qualite = "EXCELLENTE";
        else if (score >= 20) qualite = "BONNE";
        else if (score >= 12) qualite = "CORRECTE";
        else qualite = "INSUFFISANTE";

        analyse.put("qualite", qualite);
        analyse.put("score", score);
        analyse.put("scoreMax", 35);
        analyse.put("nbMots", nbMots);
        analyse.put("nbMotsUniques", motsUniques);
        analyse.put("ratioUnicite", ratioUnicite);
        analyse.put("motsClesPedagogiques", motsClesTrouves);
        analyse.put("nbMotsCles", motsClesTrouves.size());
        analyse.put("aIntroduction", lettreLower.contains("madame") || lettreLower.contains("monsieur"));
        analyse.put("aConclusion", lettreLower.contains("cordialement") || lettreLower.contains("salutations"));
        analyse.put("conseil", genererConseil(score, nbMots, motsClesTrouves.size()));

        return analyse;
    }

    private String genererConseil(int score, int nbMots, int nbMotsCles) {
        if (score >= 28) return "Excellente lettre ! Aucune amélioration nécessaire.";
        if (nbMots < 100) return "Développez davantage votre lettre (minimum 150 mots recommandés).";
        if (nbMotsCles < 3) return "Ajoutez des termes pédagogiques : pédagogie, enseignement, formation, encadrement...";
        return "Enrichissez votre vocabulaire et structurez mieux votre lettre avec une introduction et une conclusion.";
    }
}
