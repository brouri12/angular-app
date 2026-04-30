package com.elearning.quizbadge.controller;

import com.elearning.quizbadge.dto.*;
import com.elearning.quizbadge.service.QuizAdvancedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuizAdvancedController {

    private final QuizAdvancedService quizAdvancedService;

    /**
     * Endpoint métier: vérification d'éligibilité avant démarrage.
     */
    @GetMapping("/api/quizzes/{id}/eligibility")
    public ResponseEntity<QuizEligibilityResponse> eligibility(
            @PathVariable Long id,
            @RequestParam Long studentId
    ) {
        return ResponseEntity.ok(quizAdvancedService.checkEligibility(id, studentId));
    }

    /**
     * Endpoint métier: démarrer ou reprendre une session quiz.
     */
    @PostMapping("/api/quiz-sessions/start")
    public ResponseEntity<QuizSessionStartResponse> start(@Valid @RequestBody QuizSessionStartRequest request) {
        return ResponseEntity.ok(quizAdvancedService.startOrResume(request));
    }

    /**
     * Endpoint métier: autosave d'une session en cours.
     */
    @PutMapping("/api/quiz-sessions/{id}")
    public ResponseEntity<?> save(
            @PathVariable Long id,
            @Valid @RequestBody QuizSessionSaveRequest request
    ) {
        quizAdvancedService.saveProgress(id, request);
        return ResponseEntity.ok(java.util.Map.of("ok", true));
    }

    /**
     * Endpoint métier: soumission finale et scoring serveur.
     */
    @PostMapping("/api/quiz-sessions/{id}/submit")
    public ResponseEntity<QuizSessionSubmitResponse> submit(
            @PathVariable Long id,
            @Valid @RequestBody QuizSessionSubmitRequest request
    ) {
        return ResponseEntity.ok(quizAdvancedService.submit(id, request));
    }

    /**
     * Signalement proctoring caméra (téléphone, plusieurs personnes, coupure caméra) pendant une session en cours.
     */
    @PostMapping("/api/quiz-sessions/{id}/proctoring-event")
    public ResponseEntity<java.util.Map<String, Object>> proctoringEvent(
            @PathVariable Long id,
            @Valid @RequestBody ProctoringEventRequest request
    ) {
        quizAdvancedService.recordProctoringEvent(id, request);
        return ResponseEntity.ok(java.util.Map.of("ok", true));
    }
}
