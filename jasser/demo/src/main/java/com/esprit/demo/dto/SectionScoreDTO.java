package com.esprit.demo.dto;

import com.esprit.demo.entity.QuestionSection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for section-based score breakdown
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SectionScoreDTO {
    private QuestionSection section;
    private Double score;
    private Double maxScore;
    private Double percentage;
}
