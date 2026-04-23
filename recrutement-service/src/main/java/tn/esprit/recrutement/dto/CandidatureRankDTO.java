package tn.esprit.recrutement.dto;

import lombok.*;
import tn.esprit.recrutement.entity.CandidatureEnseignant;

/**
 * DTO pour le classement des candidatures avec score et rang.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidatureRankDTO {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String statut;
    private int score;           // Score global 0-100
    private int rang;            // Position dans le classement
    private String niveauScore;  // EXCELLENT / BON / MOYEN / FAIBLE
    private int scoreExperience;
    private int scoreLettre;
    private String qualiteLettre;

    public static CandidatureRankDTO from(CandidatureEnseignant c, int score, int rang,
                                          int scoreLettre, String qualiteLettre) {
        CandidatureRankDTO dto = new CandidatureRankDTO();
        dto.setId(c.getId());
        dto.setNom(c.getNom_candidat());
        dto.setPrenom(c.getPrenom_candidat());
        dto.setEmail(c.getEmail());
        dto.setStatut(c.getStatut());
        dto.setScore(score);
        dto.setRang(rang);
        dto.setScoreLettre(scoreLettre);
        dto.setQualiteLettre(qualiteLettre);
        dto.setNiveauScore(score >= 75 ? "EXCELLENT" : score >= 50 ? "BON" : score >= 25 ? "MOYEN" : "FAIBLE");
        return dto;
    }
}
