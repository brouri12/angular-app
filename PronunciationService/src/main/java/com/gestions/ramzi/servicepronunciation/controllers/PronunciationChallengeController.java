package com.gestions.ramzi.servicepronunciation.controllers;

import com.gestions.ramzi.servicepronunciation.entities.PronunciationChallenge;
import com.gestions.ramzi.servicepronunciation.entities.UserRecording;
import com.gestions.ramzi.servicepronunciation.enums.ChallengeType;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import com.gestions.ramzi.servicepronunciation.services.PronunciationChallengeService;
import com.gestions.ramzi.servicepronunciation.services.RecordingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pronunciation/challenges")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class PronunciationChallengeController {

    private final PronunciationChallengeService challengeService;
    private final RecordingService recordingService;

    /**
     * Créer un nouveau défi de prononciation
     */
    @PostMapping
    public ResponseEntity<PronunciationChallenge> createChallenge(@RequestBody PronunciationChallenge challenge) {
        log.info("Creating new challenge: {}", challenge.getPhrase());
        PronunciationChallenge created = challengeService.createChallenge(challenge);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Obtenir tous les défis avec pagination
     */
    @GetMapping
    public ResponseEntity<Page<PronunciationChallenge>> getAllChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PronunciationChallenge> challenges = challengeService.getAllChallenges(pageable);
        return ResponseEntity.ok(challenges);
    }

    /**
     * Obtenir tous les défis actifs (sans pagination)
     */
    @GetMapping("/active")
    public ResponseEntity<List<PronunciationChallenge>> getActiveChallenges() {
        List<PronunciationChallenge> challenges = challengeService.getAllActiveChallenges();
        return ResponseEntity.ok(challenges);
    }

    /**
     * Obtenir un défi par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PronunciationChallenge> getChallengeById(@PathVariable Long id) {
        return challengeService.getChallengeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtenir un défi aléatoire par niveau
     */
    @GetMapping("/random")
    public ResponseEntity<PronunciationChallenge> getRandomChallenge(
            @RequestParam(required = false) NiveauCECRL niveau) {
        return challengeService.getRandomChallengeByNiveau(niveau)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Obtenir des défis par niveau
     */
    @GetMapping("/niveau/{niveau}")
    public ResponseEntity<List<PronunciationChallenge>> getChallengesByNiveau(@PathVariable NiveauCECRL niveau) {
        List<PronunciationChallenge> challenges = challengeService.getChallengesByNiveau(niveau);
        return ResponseEntity.ok(challenges);
    }

    /**
     * Obtenir des défis par type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PronunciationChallenge>> getChallengesByType(@PathVariable ChallengeType type) {
        List<PronunciationChallenge> challenges = challengeService.getChallengesByType(type);
        return ResponseEntity.ok(challenges);
    }

    /**
     * Rechercher des défis
     */
    @GetMapping("/search")
    public ResponseEntity<List<PronunciationChallenge>> searchChallenges(@RequestParam String keyword) {
        List<PronunciationChallenge> challenges = challengeService.searchChallenges(keyword);
        return ResponseEntity.ok(challenges);
    }
    /**
     * Obtenir les enregistrements d'un défi (pour l'admin)
     * GET /api/pronunciation/challenges/{challengeId}/recordings
     */
    @GetMapping("/{challengeId}/recordings")
    public ResponseEntity<List<UserRecording>> getChallengeRecordings(@PathVariable Long challengeId) {
        try {
            List<UserRecording> recordings = recordingService.getRecordingsByChallenge(challengeId);
            log.info("Retrieved {} recordings for challenge ID: {}", recordings.size(), challengeId);
            return ResponseEntity.ok(recordings);
        } catch (Exception e) {
            log.error("Error fetching recordings for challenge {}", challengeId, e);
            return ResponseEntity.ok(List.of()); // Return empty list instead of error
        }
    }
    /**
     * Obtenir les défis les plus réussis
     */
    @GetMapping("/most-successful")
    public ResponseEntity<List<PronunciationChallenge>> getMostSuccessfulChallenges(
            @RequestParam(defaultValue = "10") int limit) {
        List<PronunciationChallenge> challenges = challengeService.getMostSuccessfulChallenges(limit);
        return ResponseEntity.ok(challenges);
    }

    /**
     * Obtenir les défis les plus échoués
     */
    @GetMapping("/most-failed")
    public ResponseEntity<List<PronunciationChallenge>> getMostFailedChallenges(
            @RequestParam(defaultValue = "10") int limit) {
        List<PronunciationChallenge> challenges = challengeService.getMostFailedChallenges(limit);
        return ResponseEntity.ok(challenges);
    }

    /**
     * Obtenir les statistiques d'un défi
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getChallengeStats(@PathVariable Long id) {
        return challengeService.getChallengeById(id)
                .map(challenge -> {
                    Map<String, Object> stats = new HashMap<>();
                    stats.put("id", challenge.getId());
                    stats.put("phrase", challenge.getPhrase());
                    stats.put("niveau", challenge.getNiveau());
                    stats.put("totalSubmissions", challenge.getTotalSubmissions());
                    stats.put("averageScore", challenge.getAverageScore());
                    return ResponseEntity.ok(stats);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Mettre à jour un défi
     */
    @PutMapping("/{id}")
    public ResponseEntity<PronunciationChallenge> updateChallenge(
            @PathVariable Long id,
            @RequestBody PronunciationChallenge challenge) {
        try {
            PronunciationChallenge updated = challengeService.updateChallenge(id, challenge);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Supprimer (désactiver) un défi
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable Long id) {
        try {
            challengeService.deleteChallenge(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Créer des défis par défaut (pour tests)
     */
    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> seedDefaultChallenges() {
        challengeService.createDefaultChallenges();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Default challenges created successfully");
        return ResponseEntity.ok(response);
    }
}

