package com.esprit.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for evaluation result with automatic classification
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationResultDTO {
    private Long evaluationId;
    private String evaluationTitle;
    private Double totalScore;
    private Double maxScore;  // Total possible score (20)
    private String classification;  // Excellent / Good / Weak
    private Map<String, Double> sectionBreakdown;  // Score by section
}
