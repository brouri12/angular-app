package com.esprit.demo.controllers;

import com.esprit.demo.dto.EvaluationResultDTO;
import com.esprit.demo.dto.SectionScoreDTO;
import com.esprit.demo.entity.Note;
import com.esprit.demo.service.NoteService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@AllArgsConstructor
@RequestMapping("/note")
public class NoteController {
    
    private final NoteService noteService;

    /**
     * Get all notes for an evaluation
     */
    @GetMapping("/evaluation/{evalId}")
    public ResponseEntity<List<Note>> getNotesByEvaluation(@PathVariable Long evalId) {
        return ResponseEntity.ok(noteService.getNotesByEvaluation(evalId));
    }

    /**
     * Calculate total score for an evaluation
     */
    @GetMapping("/evaluation/{evalId}/total-score")
    public ResponseEntity<Map<String, Double>> getTotalScore(@PathVariable Long evalId) {
        Double totalScore = noteService.calculateTotalScore(evalId);
        Map<String, Double> response = new HashMap<>();
        response.put("totalScore", totalScore);
        return ResponseEntity.ok(response);
    }

    /**
     * Get evaluation result with automatic classification
     * Uses JPQL CASE WHEN for smart classification
     */
    @GetMapping("/evaluation/{evalId}/result")
    public ResponseEntity<EvaluationResultDTO> getEvaluationResult(@PathVariable Long evalId) {
        return ResponseEntity.ok(noteService.getEvaluationResult(evalId));
    }

    /**
     * Get all evaluation results with classifications
     */
    @GetMapping("/results/all")
    public ResponseEntity<List<EvaluationResultDTO>> getAllEvaluationResults() {
        return ResponseEntity.ok(noteService.getAllEvaluationResults());
    }

    /**
     * Get section score breakdown
     */
    @GetMapping("/evaluation/{evalId}/breakdown")
    public ResponseEntity<List<SectionScoreDTO>> getSectionBreakdown(@PathVariable Long evalId) {
        return ResponseEntity.ok(noteService.getSectionBreakdown(evalId));
    }

    /**
     * Get classification statistics
     */
    @GetMapping("/statistics/classifications")
    public ResponseEntity<Map<String, Long>> getClassificationStatistics() {
        return ResponseEntity.ok(noteService.getClassificationStatistics());
    }

    /**
     * Manually update essay score (for teacher grading)
     */
    @PutMapping("/{noteId}/essay-score")
    public ResponseEntity<Note> updateEssayScore(
            @PathVariable Long noteId,
            @RequestBody Map<String, Double> request) {
        Double score = request.get("score");
        return ResponseEntity.ok(noteService.updateEssayScore(noteId, score));
    }
}
