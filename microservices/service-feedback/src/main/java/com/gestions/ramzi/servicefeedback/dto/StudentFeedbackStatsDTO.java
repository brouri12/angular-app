package com.gestions.ramzi.servicefeedback.dto;

import java.util.Map;

/**
 * DTO pour les statistiques de feedback d'un étudiant
 */
public class StudentFeedbackStatsDTO {
    
    private Long userId;
    private Long totalFeedbacks;
    private Double noteMoyenne;
    private Map<String, Long> feedbacksParSentiment;
    private Map<Long, CoursNoteDTO> feedbacksParCours;
    
    public StudentFeedbackStatsDTO() {}
    
    public StudentFeedbackStatsDTO(Long userId, Long totalFeedbacks, Double noteMoyenne, 
                                   Map<String, Long> feedbacksParSentiment,
                                   Map<Long, CoursNoteDTO> feedbacksParCours) {
        this.userId = userId;
        this.totalFeedbacks = totalFeedbacks;
        this.noteMoyenne = noteMoyenne;
        this.feedbacksParSentiment = feedbacksParSentiment;
        this.feedbacksParCours = feedbacksParCours;
    }
    
    // Getters et Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getTotalFeedbacks() {
        return totalFeedbacks;
    }
    
    public void setTotalFeedbacks(Long totalFeedbacks) {
        this.totalFeedbacks = totalFeedbacks;
    }
    
    public Double getNoteMoyenne() {
        return noteMoyenne;
    }
    
    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }
    
    public Map<String, Long> getFeedbacksParSentiment() {
        return feedbacksParSentiment;
    }
    
    public void setFeedbacksParSentiment(Map<String, Long> feedbacksParSentiment) {
        this.feedbacksParSentiment = feedbacksParSentiment;
    }
    
    public Map<Long, CoursNoteDTO> getFeedbacksParCours() {
        return feedbacksParCours;
    }
    
    public void setFeedbacksParCours(Map<Long, CoursNoteDTO> feedbacksParCours) {
        this.feedbacksParCours = feedbacksParCours;
    }
}

