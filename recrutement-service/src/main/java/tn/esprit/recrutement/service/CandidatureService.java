package tn.esprit.recrutement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.recrutement.dto.CandidatureRankDTO;
import tn.esprit.recrutement.entity.CandidatureEnseignant;
import tn.esprit.recrutement.entity.OffreRecrutement;
import tn.esprit.recrutement.repository.CandidatureRepository;
import tn.esprit.recrutement.repository.OffreRepository;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final OffreRepository offreRepository;
    private final EmailService emailService;
    private final ScoringService scoringService;

    public Optional<CandidatureEnseignant> postuler(Long offreId, CandidatureEnseignant candidature) {
        // Vérifier si l'offre existe
        Optional<OffreRecrutement> offre = offreRepository.findById(offreId);
        if (offre.isEmpty()) {
            return Optional.empty();
        }

        // 🔷 MÉTIER 1 : Empêcher double candidature
        if (candidature.getEmail() != null && !candidature.getEmail().isBlank()) {
            if (candidatureRepository.existsByEmailAndOffreId(candidature.getEmail(), offreId)) {
                throw new RuntimeException("Vous avez déjà postulé à cette offre avec l'email : " + candidature.getEmail());
            }
        }

        candidature.setId(null);
        candidature.setOffre(offre.get());
        candidature.setDate_candidature(LocalDate.now());
        if (candidature.getStatut() == null) {
            candidature.setStatut("EN_ATTENTE");
        }

        CandidatureEnseignant saved = candidatureRepository.save(candidature);

        return Optional.of(saved);
    }

    public Optional<CandidatureEnseignant> changerStatut(Long candidatureId, String nouveauStatut) {
        return candidatureRepository.findById(candidatureId).map(candidature -> {
            candidature.setStatut(nouveauStatut);

            if ("ACCEPTEE".equals(nouveauStatut)) {
                // Marquer l'offre comme pourvue
                OffreRecrutement offre = candidature.getOffre();
                offre.setStatut("POURVUE");
                offreRepository.save(offre);

                // ✅ Envoyer email d'acceptation au candidat
                try {
                    emailService.envoyerEmailAcceptation(candidature, offre);
                } catch (Exception e) {
                    log.warn("Email d'acceptation non envoyé: {}", e.getMessage());
                }
            }

            return candidatureRepository.save(candidature);
        });
    }

    public List<CandidatureEnseignant> getCandidaturesByOffre(Long offreId) {
        return candidatureRepository.findByOffreId(offreId);
    }

    public List<CandidatureEnseignant> filtrerParSpecialite(String specialite) {
        return candidatureRepository.findAll().stream()
                .filter(c -> c.getOffre().getSpecialite().equalsIgnoreCase(specialite))
                .toList();
    }

    public String convertirEnEnseignantSiAcceptee(Long candidatureId) {
        Optional<CandidatureEnseignant> candidature = candidatureRepository.findById(candidatureId);
        if (candidature.isEmpty()) return "Candidature introuvable";
        if (!"ACCEPTEE".equals(candidature.get().getStatut()))
            return "La candidature doit être acceptée pour être convertie";
        return "Candidat converti en enseignant avec succès : "
                + candidature.get().getNom_candidat() + " " + candidature.get().getPrenom_candidat();
    }

    public List<CandidatureEnseignant> getAllCandidatures() {
        return candidatureRepository.findAll();
    }

    public List<CandidatureEnseignant> getCandidaturesByStatut(String statut) {
        return candidatureRepository.findByStatut(statut);
    }

    // ═══════════════════════════════════════════════════════
    // MÉTIER AVANCÉ 1 : Détection de doublons de candidature
    // Vérifie si le candidat a déjà postulé à une offre de
    // même spécialité dans les 30 derniers jours
    // ═══════════════════════════════════════════════════════
    public boolean estCandidatDoublon(String email, String specialite) {
        LocalDate il_y_a_30_jours = LocalDate.now().minusDays(30);
        return candidatureRepository.existsDoublon(email, specialite, il_y_a_30_jours);
    }

    // ═══════════════════════════════════════════════════════
    // MÉTIER AVANCÉ 2 : Réaffectation automatique après refus
    // Cherche une offre compatible (même spécialité, expérience
    // suffisante, pas encore postulé) pour un candidat refusé
    // ═══════════════════════════════════════════════════════
    public Optional<OffreRecrutement> trouverOffreCompatible(Long candidatureId) {
        return candidatureRepository.findById(candidatureId).flatMap(c -> {
            if (c.getOffre() == null) return Optional.empty();
            String specialite = c.getOffre().getSpecialite();
            int experience = c.getAnnees_experience() != null ? c.getAnnees_experience() : 0;

            return offreRepository.findByStatut("OUVERTE").stream()
                    .filter(o -> o.getSpecialite().equalsIgnoreCase(specialite))
                    .filter(o -> o.getExperience_min() <= experience)
                    .filter(o -> !o.getId().equals(c.getOffre().getId()))
                    .filter(o -> !candidatureRepository.existsByEmailAndOffreId(c.getEmail(), o.getId()))
                    .findFirst();
        });
    }

    // ═══════════════════════════════════════════════════════
    // 🏆 INNOVATION : Classement des candidats par score
    // Trie les candidatures d'une offre par score décroissant
    // avec rang, niveau et analyse de la lettre
    // ═══════════════════════════════════════════════════════
    public List<CandidatureRankDTO> getClassementParOffre(Long offreId) {
        OffreRecrutement offre = offreRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        List<CandidatureEnseignant> candidatures = candidatureRepository.findByOffreId(offreId);

        // Calculer le score pour chaque candidature
        List<CandidatureRankDTO> ranked = candidatures.stream()
                .map(c -> {
                    int score = scoringService.calculerScore(c, offre);
                    int scoreLettre = scoringService.scoreLettre(c.getLettre_motivation());
                    Map<String, Object> analyse = scoringService.analyserLettre(c.getLettre_motivation());
                    String qualite = (String) analyse.getOrDefault("qualite", "N/A");
                    return CandidatureRankDTO.from(c, score, 0, scoreLettre, qualite);
                })
                .sorted(Comparator.comparingInt(CandidatureRankDTO::getScore).reversed())
                .collect(java.util.stream.Collectors.toList());

        // Assigner les rangs
        IntStream.range(0, ranked.size())
                .forEach(i -> ranked.get(i).setRang(i + 1));

        log.info("Classement calculé pour offre {}: {} candidats", offreId, ranked.size());
        return ranked;
    }

    // ═══════════════════════════════════════════════════════
    // 🏆 INNOVATION : Score d'une candidature individuelle
    // ═══════════════════════════════════════════════════════
    public Map<String, Object> getScoringDetail(Long candidatureId) {
        CandidatureEnseignant c = candidatureRepository.findById(candidatureId)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        OffreRecrutement offre = c.getOffre();
        int scoreTotal = scoringService.calculerScore(c, offre);
        Map<String, Object> analyseLettre = scoringService.analyserLettre(c.getLettre_motivation());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("candidatureId", candidatureId);
        result.put("candidat", c.getPrenom_candidat() + " " + c.getNom_candidat());
        result.put("scoreTotal", scoreTotal);
        result.put("niveauScore", scoreTotal >= 75 ? "EXCELLENT" : scoreTotal >= 50 ? "BON"
                : scoreTotal >= 25 ? "MOYEN" : "FAIBLE");
        result.put("analyseLettre", analyseLettre);
        return result;
    }
}
