package com.gestions.ramzi.servicepronunciation.controllers;

import com.gestions.ramzi.servicepronunciation.dto.ProgressDTO;
import com.gestions.ramzi.servicepronunciation.entities.UserProgress;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import com.gestions.ramzi.servicepronunciation.services.ProgressTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pronunciation/progress")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j
public class ProgressController {

    private final ProgressTrackingService progressService;

    /**
     * Obtenir progression utilisateur
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ProgressDTO> getUserProgress(@PathVariable Long userId) {
        log.info("Getting progress for user {}", userId);
        com.gestions.ramzi.servicepronunciation.dto.ProgressDTO progress = progressService.getUserProgress(userId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Leaderboard par niveau
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserProgress>> getLeaderboard(
            @RequestParam(required = false) NiveauCECRL niveau,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting leaderboard for niveau {}, limit {}", niveau, limit);
        List<UserProgress> leaderboard = progressService.getLeaderboard(niveau, limit);
        return ResponseEntity.ok(leaderboard);
    }

    /**
     * Phonèmes faibles d'un utilisateur
     */
    @GetMapping("/user/{userId}/weak-phonemes")
    public ResponseEntity<List<String>> getUserWeakPhonemes(@PathVariable Long userId) {
        UserProgress progress = progressService.getOrCreateUserProgress(userId);
        return ResponseEntity.ok(progress.getWeakPhonemes());
    }

    /**
     * Badges utilisateur
     */
@GetMapping("/user/{userId}/badges")
    public ResponseEntity<List<String>> getUserBadges(@PathVariable Long userId) {
        UserProgress progress = progressService.getOrCreateUserProgress(userId);
        List<String> badgeNames = progress.getEarnedBadges().stream()
            .map(Enum::name)
            .toList();
        return ResponseEntity.ok(badgeNames);
    }

    /**
     * Défi quotidien personnalisé
     */
    @GetMapping("/daily-challenge/{userId}")
    public ResponseEntity<String> getDailyChallenge(@PathVariable Long userId) {
        // TODO: Logique défi quotidien
        String challenge = "Today's challenge: Practice 'th' sounds!";
        return ResponseEntity.ok(challenge);
    }
}


