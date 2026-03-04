package com.esprit.demo.entity;

import com.esprit.demo.dto.ScoreResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

/**
 * Service for automatic answer scoring based on correct answers
 * Compares student answers with stored correct answers
 */
@Service
@Slf4j
public class AutomaticScoringService {

    /**
     * Automatically scores an answer by comparing with correct answers
     * Returns detailed score breakdown
     */
    public ScoreResponseDTO scoreAnswer(Answer answer) {
        Evaluation evaluation = answer.getEval();
        
        if (evaluation == null) {
            log.warn("Cannot score answer - evaluation not found");
            return new ScoreResponseDTO(
                answer.getIdAnswer(),
                0.0, 0.0, 0.0, 0.0,
                "Evaluation not found"
            );
        }

        log.info("=== SCORING ANSWER ===");
        log.info("Evaluation ID: {}", evaluation.getIdEval());
        log.info("Evaluation Title: {}", evaluation.getTitle());
        log.info("Correct Answers JSON: {}", evaluation.getCorrectAnswers());
        log.info("Correct Answers is NULL: {}", evaluation.getCorrectAnswers() == null);
        log.info("Correct Answers is EMPTY: {}", evaluation.getCorrectAnswers() != null && evaluation.getCorrectAnswers().trim().isEmpty());

        // Get weights (default to 10, 5, 5 if null)
        Double grammarWeight = evaluation.getGrammarWeight() != null ? evaluation.getGrammarWeight() : 10.0;
        Double listeningWeight = evaluation.getListeningWeight() != null ? evaluation.getListeningWeight() : 5.0;
        Double essayWeight = evaluation.getEssayWeight() != null ? evaluation.getEssayWeight() : 5.0;
        
        log.info("Weights - Grammar: {}, Listening: {}, Essay: {}", grammarWeight, listeningWeight, essayWeight);
        
        // Parse student answers
        String studentAnswerJson = answer.getAnswer();
        String correctAnswerJson = evaluation.getCorrectAnswers();
        
        log.info("Student Answer JSON: {}", studentAnswerJson);
        
        double grammarScore = 0.0;
        double listeningScore = 0.0;
        double essayScore = 0.0;
        
        try {
            JSONObject studentAnswers = new JSONObject(studentAnswerJson);
            
            // If no correct answers defined, award full points for completion (backward compatibility)
            if (correctAnswerJson == null || correctAnswerJson.trim().isEmpty()) {
                log.warn("⚠️ NO CORRECT ANSWERS DEFINED - USING BACKWARD COMPATIBILITY MODE");
                log.warn("⚠️ ALL SECTIONS WILL RECEIVE FULL POINTS!");
                
                if (studentAnswers.has("questions")) {
                    grammarScore = grammarWeight;
                    log.info("Grammar: Full points awarded ({})", grammarScore);
                }
                if (studentAnswers.has("listening")) {
                    listeningScore = listeningWeight;
                    log.info("Listening: Full points awarded ({})", listeningScore);
                }
                if (studentAnswers.has("essay")) {
                    essayScore = essayWeight;
                    log.info("Essay: Full points awarded ({})", essayScore);
                }
            } else {
                log.info("✓ Correct answers found - using comparison-based scoring");
                // Score based on correct answers
                JSONObject correctAnswers = new JSONObject(correctAnswerJson);
                
                log.info("Correct Answers Object: {}", correctAnswers.toString());
                
                // Score grammar questions
                if (studentAnswers.has("questions") && correctAnswers.has("questions")) {
                    grammarScore = scoreSection(
                        studentAnswers.getJSONArray("questions"),
                        correctAnswers.getJSONArray("questions"),
                        grammarWeight
                    );
                    log.info("Grammar score: {} / {}", grammarScore, grammarWeight);
                }
                
                // Score listening questions
                if (studentAnswers.has("listening") && correctAnswers.has("listening")) {
                    listeningScore = scoreSection(
                        studentAnswers.getJSONArray("listening"),
                        correctAnswers.getJSONArray("listening"),
                        listeningWeight
                    );
                    log.info("Listening score: {} / {}", listeningScore, listeningWeight);
                }
                
                // Essay scored manually (0 initially)
                essayScore = 0.0;
                log.info("Essay score: 0.0 (manual grading required)");
            }
            
        } catch (Exception e) {
            log.error("❌ Error parsing answers for scoring: {}", e.getMessage(), e);
        }
        
        double totalScore = grammarScore + listeningScore + essayScore;
        
        log.info("=== FINAL SCORE: {} / 20 ===", totalScore);
        
        return new ScoreResponseDTO(
            answer.getIdAnswer(),
            totalScore,
            grammarScore,
            listeningScore,
            essayScore,
            String.format("Score calculated successfully. Total: %.1f/20", totalScore)
        );
    }

    /**
     * Score a section by comparing student answers with correct answers
     * Returns proportional score based on number of correct answers
     */
    private double scoreSection(JSONArray studentAnswers, JSONArray correctAnswers, double weight) {
        int correctCount = 0;
        int totalQuestions = correctAnswers.length();
        
        if (totalQuestions == 0) {
            return 0.0;
        }
        
        // Compare each answer
        for (int i = 0; i < totalQuestions; i++) {
            String studentAnswer = studentAnswers.optString(i, "");
            String correctAnswer = correctAnswers.optString(i, "");
            
            // Normalize and compare
            if (normalizeAnswer(studentAnswer).equals(normalizeAnswer(correctAnswer))) {
                correctCount++;
                log.debug("Question {}: CORRECT (student: '{}', correct: '{}')", 
                    i + 1, studentAnswer, correctAnswer);
            } else {
                log.debug("Question {}: INCORRECT (student: '{}', correct: '{}')", 
                    i + 1, studentAnswer, correctAnswer);
            }
        }
        
        // Calculate proportional score
        double score = ((double) correctCount / totalQuestions) * weight;
        log.info("Section scored: {} / {} correct = {:.2f} / {} points", 
            correctCount, totalQuestions, score, weight);
        
        return score;
    }

    /**
     * Normalize answer for comparison
     * - Trim whitespace
     * - Convert to lowercase
     * - Remove extra spaces
     */
    private String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        return answer.trim().toLowerCase().replaceAll("\\s+", " ");
    }
}
