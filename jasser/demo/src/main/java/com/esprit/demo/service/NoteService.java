package com.esprit.demo.service;

import com.esprit.demo.dto.EvaluationResultDTO;
import com.esprit.demo.dto.SectionScoreDTO;
import com.esprit.demo.entity.Evaluation;
import com.esprit.demo.entity.Note;
import com.esprit.demo.entity.QuestionSection;
import com.esprit.demo.repository.EvaluationRepo;
import com.esprit.demo.repository.NoteRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing notes and calculating evaluation results
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NoteService {
    
    private final NoteRepo noteRepo;
    private final EvaluationRepo evaluationRepo;

    /**
     * Get all notes for an evaluation
     */
    public List<Note> getNotesByEvaluation(Long evalId) {
        return noteRepo.findByEvaluationId(evalId);
    }
    
    /**
     * Add a new note
     */
    @Transactional
    public Note addNote(Note note) {
        return noteRepo.save(note);
    }

    /**
     * Calculate total score for an evaluation using JPQL
     */
    public Double calculateTotalScore(Long evalId) {
        return noteRepo.calculateTotalScore(evalId);
    }

    /**
     * Get evaluation result with automatic classification
     * Uses JPQL CASE WHEN for dynamic classification
     */
    @Transactional(readOnly = true)
    public EvaluationResultDTO getEvaluationResult(Long evalId) {
        Evaluation evaluation = evaluationRepo.findById(evalId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));

        // Get result with classification using JPQL
        Object[] result = noteRepo.getEvaluationResultWithClassification(evalId);
        
        Double totalScore = 0.0;
        String classification = "Weak";
        
        if (result != null && result.length >= 2) {
            totalScore = (Double) result[0];
            classification = (String) result[1];
        }

        // Get section breakdown
        List<Object[]> breakdown = noteRepo.getScoreBreakdownBySection(evalId);
        Map<String, Double> sectionBreakdown = new HashMap<>();
        
        for (Object[] row : breakdown) {
            QuestionSection section = (QuestionSection) row[0];
            Double score = (Double) row[1];
            sectionBreakdown.put(section.name(), score);
        }

        // Calculate max score
        Double maxScore = evaluation.getGrammarWeight() + 
                         evaluation.getListeningWeight() + 
                         evaluation.getEssayWeight();

        return new EvaluationResultDTO(
            evalId,
            evaluation.getTitle(),
            totalScore,
            maxScore,
            classification,
            sectionBreakdown
        );
    }

    /**
     * Get all evaluation results with classifications
     */
    @Transactional(readOnly = true)
    public List<EvaluationResultDTO> getAllEvaluationResults() {
        List<Object[]> results = noteRepo.getAllEvaluationResultsWithClassifications();
        
        return results.stream().map(row -> {
            Long evalId = (Long) row[0];
            Double totalScore = (Double) row[1];
            String classification = (String) row[2];
            
            Evaluation evaluation = evaluationRepo.findById(evalId).orElse(null);
            if (evaluation == null) {
                return null;
            }
            
            Double maxScore = evaluation.getGrammarWeight() + 
                             evaluation.getListeningWeight() + 
                             evaluation.getEssayWeight();
            
            return new EvaluationResultDTO(
                evalId,
                evaluation.getTitle(),
                totalScore,
                maxScore,
                classification,
                null
            );
        }).filter(dto -> dto != null).collect(Collectors.toList());
    }

    /**
     * Get section score breakdown with percentages
     */
    @Transactional(readOnly = true)
    public List<SectionScoreDTO> getSectionBreakdown(Long evalId) {
        Evaluation evaluation = evaluationRepo.findById(evalId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found"));

        List<Object[]> breakdown = noteRepo.getScoreBreakdownBySection(evalId);
        
        return breakdown.stream().map(row -> {
            QuestionSection section = (QuestionSection) row[0];
            Double score = (Double) row[1];
            
            Double maxScore = getMaxScoreForSection(section, evaluation);
            Double percentage = maxScore > 0 ? (score / maxScore) * 100 : 0.0;
            
            return new SectionScoreDTO(section, score, maxScore, percentage);
        }).collect(Collectors.toList());
    }

    /**
     * Get classification statistics
     */
    public Map<String, Long> getClassificationStatistics() {
        List<Object[]> stats = noteRepo.getClassificationStatistics();
        
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : stats) {
            String classification = (String) row[0];
            Long count = (Long) row[1];
            result.put(classification, count);
        }
        
        return result;
    }

    /**
     * Manually update essay score (for teacher grading)
     */
    @Transactional
    public Note updateEssayScore(Long noteId, Double score) {
        Note note = noteRepo.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        
        if (note.getSection() != QuestionSection.ESSAY) {
            throw new RuntimeException("Can only manually update essay scores");
        }
        
        Evaluation evaluation = note.getEvaluation();
        if (score > evaluation.getEssayWeight()) {
            throw new RuntimeException("Score cannot exceed essay weight: " + evaluation.getEssayWeight());
        }
        
        note.setValue(score);
        return noteRepo.save(note);
    }

    /**
     * Helper method to get max score for a section
     */
    private Double getMaxScoreForSection(QuestionSection section, Evaluation evaluation) {
        switch (section) {
            case GRAMMAR:
                return evaluation.getGrammarWeight();
            case LISTENING:
                return evaluation.getListeningWeight();
            case ESSAY:
                return evaluation.getEssayWeight();
            default:
                return 0.0;
        }
    }
}
