package com.gestions.ramzi.servicepronunciation.controllers;


import com.gestions.ramzi.servicepronunciation.dto.UserRecordingDTO;
import com.gestions.ramzi.servicepronunciation.entities.Phoneme;
import com.gestions.ramzi.servicepronunciation.entities.PronunciationChallenge;
import com.gestions.ramzi.servicepronunciation.entities.UserRecording;
import com.gestions.ramzi.servicepronunciation.services.PhonemeService;
import com.gestions.ramzi.servicepronunciation.services.PronunciationChallengeService;
import com.gestions.ramzi.servicepronunciation.services.RecordingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pronunciation/admin")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final PronunciationChallengeService challengeService;
    private final PhonemeService phonemeService;
    private final RecordingService   recordingService;

    /**
     * Global statistics for admin dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        Map<String, Object> stats = challengeService.getGlobalAdminStats();
        log.info("Admin global stats retrieved successfully");
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all challenges with pagination (admin view)
     */
    @GetMapping("/challenges")
    public ResponseEntity<Page<PronunciationChallenge>> getAllChallenges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PronunciationChallenge> challenges = challengeService.getAllChallenges(pageable);
        return ResponseEntity.ok(challenges);
    }

    /**
     * Get recordings for a specific challenge (admin)
     */
    @GetMapping("/challenges/{challengeId}/recordings")
    public List<UserRecording> getChallengeRecordings(@PathVariable Long challengeId) {
        return this.recordingService.getOneChallengeRecordings(challengeId);
    }

    /**
     * Get all phonemes
     */
    @GetMapping("/phonemes")
    public ResponseEntity<List<Phoneme>> getAllPhonemes() {
        return ResponseEntity.ok(phonemeService.getAllPhonemes());
    }

    /**
     * Get common problematic phonemes
     */
    @GetMapping("/phonemes/problematic")
    public ResponseEntity<List<Phoneme>> getCommonProblematicPhonemes() {
        return ResponseEntity.ok(phonemeService.getCommonProblematicPhonemes());
    }

    /**
     * Get student pronunciation progress (placeholder)
     */
    @GetMapping("/students/{userId}/pronunciation")
    public ResponseEntity<Map<String, Object>> getStudentPronunciation(@PathVariable Long userId) {
        log.info("Admin requested progress for user {}", userId);
        Map<String, Object> progress = new HashMap<>();
        progress.put("userId", userId);
        progress.put("globalAverageScore", 0.0);
        progress.put("totalRecordings", 0);
        progress.put("currentStreak", 0);
        progress.put("estimatedLevel", "A1");
        return ResponseEntity.ok(progress);
    }
}