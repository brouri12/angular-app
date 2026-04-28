package tn.esprit.recrutement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import tn.esprit.recrutement.entity.CandidatureEnseignant;
import tn.esprit.recrutement.entity.OffreRecrutement;
import tn.esprit.recrutement.repository.CandidatureRepository;
import tn.esprit.recrutement.service.CandidatureService;
import tn.esprit.recrutement.service.OffreService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recrutement")
@RequiredArgsConstructor
public class RecrutementRestAPI {
    
    private final OffreService offreService;
    private final CandidatureService candidatureService;
    private final CandidatureRepository candidatureRepository;
    private final tn.esprit.recrutement.service.ScoringService scoringService;
    
    // ========== CRUD OFFRES ==========
    
    @GetMapping("/offres")
    public ResponseEntity<List<OffreRecrutement>> getAllOffres() {
        return ResponseEntity.ok(offreService.getAllOffres());
    }
    
    @GetMapping("/offres/{id}")
    public ResponseEntity<OffreRecrutement> getOffreById(@PathVariable Long id) {
        return offreService.getOffreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/offres")
    public ResponseEntity<OffreRecrutement> addOffre(@Valid @RequestBody OffreRecrutement offre) {
        OffreRecrutement savedOffre = offreService.addOffre(offre);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOffre);
    }
    
    @PutMapping("/offres/{id}")
    public ResponseEntity<OffreRecrutement> updateOffre(
            @PathVariable Long id, 
            @Valid @RequestBody OffreRecrutement offre) {
        return offreService.updateOffre(id, offre)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/offres/{id}")
    public ResponseEntity<Void> deleteOffre(@PathVariable Long id) {
        if (offreService.deleteOffre(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PatchMapping("/offres/{id}/fermer")
    public ResponseEntity<OffreRecrutement> fermerOffre(@PathVariable Long id) {
        return offreService.fermerOffre(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/offres/{id}/rouvrir")
    public ResponseEntity<OffreRecrutement> rouvrirOffre(@PathVariable Long id) {
        return offreService.rouvrirOffre(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    @GetMapping("/offres/statut/{statut}")
    public ResponseEntity<List<OffreRecrutement>> getOffresByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(offreService.getOffresByStatut(statut));
    }
    
    @GetMapping("/offres/specialite/{specialite}")
    public ResponseEntity<List<OffreRecrutement>> getOffresBySpecialite(@PathVariable String specialite) {
        return ResponseEntity.ok(offreService.getOffresBySpecialite(specialite));
    }
    
    // ========== GESTION CANDIDATURES ==========
    
    @GetMapping("/candidatures")
    public ResponseEntity<List<CandidatureEnseignant>> getAllCandidatures() {
        return ResponseEntity.ok(candidatureService.getAllCandidatures());
    }

    @PostMapping("/candidatures/offre/{offreId}")
    public ResponseEntity<Object> postuler(
            @PathVariable Long offreId,
            @RequestBody CandidatureEnseignant candidature,
            BindingResult bindingResult) {

        System.out.println("📥 Requête POST reçue pour offre ID: " + offreId);
        System.out.println("📦 Candidature reçue: " + candidature.getNom_candidat() + " " + candidature.getPrenom_candidat());
        System.out.println("📧 Email: " + candidature.getEmail());
        System.out.println("📄 CV filename: " + candidature.getCv_filename());
        System.out.println("📝 Lettre motivation length: " + (candidature.getLettre_motivation() != null ? candidature.getLettre_motivation().length() : 0));
        
        if (bindingResult.hasErrors()) {
            System.out.println("❌ Erreurs de validation:");
            bindingResult.getAllErrors().forEach(error -> {
                System.out.println("  - " + error.getDefaultMessage());
            });
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> {
                errors.put(error.getField(), error.getDefaultMessage());
            });
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            System.out.println("✅ Validation OK, appel du service...");
            return candidatureService.postuler(offreId, candidature)
                    .<ResponseEntity<Object>>map(saved -> {
                        System.out.println("✅ Candidature créée avec succès: " + saved.getId());
                        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
                    })
                    .orElseGet(() -> {
                        System.out.println("❌ Offre introuvable");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Offre introuvable");
                    });

        } catch (RuntimeException e) {
            System.out.println("❌ Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }


    @PatchMapping("/candidatures/{id}/statut")
    public ResponseEntity<CandidatureEnseignant> changerStatut(
            @PathVariable Long id,
            @RequestParam String statut) {
        return candidatureService.changerStatut(id, statut)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/candidatures/offre/{offreId}")
    public ResponseEntity<List<CandidatureEnseignant>> getCandidaturesByOffre(@PathVariable Long offreId) {
        return ResponseEntity.ok(candidatureService.getCandidaturesByOffre(offreId));
    }
    
    @GetMapping("/candidatures/statut/{statut}")
    public ResponseEntity<List<CandidatureEnseignant>> getCandidaturesByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(candidatureService.getCandidaturesByStatut(statut));
    }
    
    @GetMapping("/candidatures/specialite/{specialite}")
    public ResponseEntity<List<CandidatureEnseignant>> filtrerParSpecialite(@PathVariable String specialite) {
        return ResponseEntity.ok(candidatureService.filtrerParSpecialite(specialite));
    }
    
    @PostMapping("/candidatures/{id}/convertir")
    public ResponseEntity<String> convertirEnEnseignant(@PathVariable Long id) {
        String result = candidatureService.convertirEnEnseignantSiAcceptee(id);
        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // MÉTIER AVANCÉ 1 : Vérifier si doublon de candidature
    // GET /api/recrutement/candidatures/doublon?email=x&specialite=y
    // ═══════════════════════════════════════════════════════
    @GetMapping("/candidatures/doublon")
    public ResponseEntity<Map<String, Object>> verifierDoublon(
            @RequestParam String email,
            @RequestParam String specialite) {
        boolean estDoublon = candidatureService.estCandidatDoublon(email, specialite);
        Map<String, Object> result = new HashMap<>();
        result.put("estDoublon", estDoublon);
        result.put("email", email);
        result.put("specialite", specialite);
        result.put("message", estDoublon
                ? "Ce candidat a déjà postulé à une offre de spécialité '" + specialite + "' dans les 30 derniers jours."
                : "Aucun doublon détecté. Le candidat peut postuler.");
        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // MÉTIER AVANCÉ 2 : Trouver offre compatible après refus
    // GET /api/recrutement/candidatures/{id}/offre-compatible
    // ═══════════════════════════════════════════════════════
    @GetMapping("/candidatures/{id}/offre-compatible")
    public ResponseEntity<Object> trouverOffreCompatible(@PathVariable Long id) {
        return candidatureService.trouverOffreCompatible(id)
                .<ResponseEntity<Object>>map(offre -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("offreCompatible", offre);
                    result.put("message", "Une offre compatible a été trouvée pour ce candidat.");
                    return ResponseEntity.ok(result);
                })
                .orElseGet(() -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("offreCompatible", null);
                    result.put("message", "Aucune offre compatible trouvée pour ce candidat.");
                    return ResponseEntity.ok(result);
                });
    }

    @GetMapping("/candidatures/{id}/cv")
    public ResponseEntity<byte[]> downloadCV(@PathVariable Long id) {
        return candidatureRepository.findById(id)
            .filter(c -> c.getCv_pdf() != null && c.getCv_pdf().length > 0)
            .map(c -> {
                String contentType = c.getCv_content_type() != null ? c.getCv_content_type() : "application/pdf";
                String filename = c.getCv_filename() != null ? c.getCv_filename() : "CV.pdf";
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(c.getCv_pdf());
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // ═══════════════════════════════════════════════════════════════
    // 🏆 INNOVATION 1 : Classement des candidats par score
    // GET /api/recrutement/offres/{id}/classement
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/offres/{id}/classement")
    public ResponseEntity<List<tn.esprit.recrutement.dto.CandidatureRankDTO>> getClassement(
            @PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.getClassementParOffre(id));
    }

    // ═══════════════════════════════════════════════════════════════
    // 🏆 INNOVATION 2 : Score détaillé d'une candidature
    // GET /api/recrutement/candidatures/{id}/scoring
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/candidatures/{id}/scoring")
    public ResponseEntity<Map<String, Object>> getScoringDetail(@PathVariable Long id) {
        return ResponseEntity.ok(candidatureService.getScoringDetail(id));
    }

    // ═══════════════════════════════════════════════════════════════
    // 🏆 INNOVATION 3 : Analyse NLP de la lettre de motivation
    // POST /api/recrutement/analyse-lettre
    // Body: {"lettre": "..."}
    // ═══════════════════════════════════════════════════════════════
    @PostMapping("/analyse-lettre")
    public ResponseEntity<Map<String, Object>> analyserLettre(
            @RequestBody Map<String, String> body) {
        String lettre = body.getOrDefault("lettre", "");
        return ResponseEntity.ok(scoringService.analyserLettre(lettre));
    }
}
