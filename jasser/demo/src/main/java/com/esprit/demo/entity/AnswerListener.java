package com.esprit.demo.entity;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * JPA Entity Listener for automatic answer scoring
 * Executes before Answer is saved to database
 */
@Slf4j
@Component
public class AnswerListener {

    private static AutomaticScoringService scoringService;

    @Autowired
    public void setScoringService(AutomaticScoringService service) {
        AnswerListener.scoringService = service;
    }

    /**
     * Called automatically before Answer is persisted
     * Generates Note based on answer correctness and section weight
     */
    @PrePersist
    public void beforeSave(Answer answer) {
        log.info("AnswerListener triggered for answer: {}", answer.getIdAnswer());
        
        if (scoringService != null && answer.getQuestion() != null) {
            scoringService.scoreAnswer(answer);
        } else {
            log.warn("Scoring service not available or question not set for answer");
        }
    }

    /**
     * Called automatically before Answer is updated
     */
    @PreUpdate
    public void beforeUpdate(Answer answer) {
        log.info("AnswerListener update triggered for answer: {}", answer.getIdAnswer());
        
        if (scoringService != null && answer.getQuestion() != null) {
            scoringService.scoreAnswer(answer);
        }
    }
}
