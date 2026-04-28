package com.gestions.ramzi.servicefeedback.controllers;

import com.gestions.ramzi.servicefeedback.dto.StudentFeedbackStatsDTO;
import com.gestions.ramzi.servicefeedback.dto.StudentReclamationStatsDTO;
import com.gestions.ramzi.servicefeedback.services.FeedbackService;
import com.gestions.ramzi.servicefeedback.services.ReclamationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller pour le dashboard étudiant
 * Endpoints pour récupérer les statistiques personnelles
 */
@RestController
@RequestMapping("/api/dashboard")
public class StudentDashboardController {

    private static final Logger logger = LoggerFactory.getLogger(StudentDashboardController.class);
    
    private final FeedbackService feedbackService;
    private final ReclamationService reclamationService;

    public StudentDashboardController(FeedbackService feedbackService, ReclamationService reclamationService) {
        this.feedbackService = feedbackService;
        this.reclamationService = reclamationService;
        logger.info("StudentDashboardController initialized");
    }

    /**
     * Récupère les statistiques de feedback pour un étudiant
     * GET /api/dashboard/student/{userId}/feedbacks
     */
    @GetMapping("/student/{userId}/feedbacks")
    public StudentFeedbackStatsDTO getStudentFeedbackStats(@PathVariable Long userId) {
        logger.info("GET /api/dashboard/student/{}/feedbacks", userId);
        
        try {
            StudentFeedbackStatsDTO stats = feedbackService.getStudentFeedbackStats(userId);
            logger.info("Stats retrieved for user {}: {} feedbacks, moyenne: {}", 
                userId, stats.getTotalFeedbacks(), stats.getNoteMoyenne());
            return stats;
        } catch (Exception e) {
            logger.error("Error getting feedback stats for user {}: {}", userId, e.getMessage(), e);
            // Return empty stats on error
            return new StudentFeedbackStatsDTO(userId, 0L, 0.0, new HashMap<>(), new HashMap<>());
        }
    }

    /**
     * Récupère les statistiques de réclamation pour un étudiant
     * GET /api/dashboard/student/{userId}/reclamations
     */
    @GetMapping("/student/{userId}/reclamations")
    public StudentReclamationStatsDTO getStudentReclamationStats(@PathVariable Long userId) {
        logger.info("GET /api/dashboard/student/{}/reclamations", userId);
        
        try {
            StudentReclamationStatsDTO stats = reclamationService.getStudentReclamationStats(userId);
            logger.info("Stats retrieved for user {}: {} reclamations, en attente: {}", 
                userId, stats.getTotalReclamations(), stats.getReclamationEnAttente());
            return stats;
        } catch (Exception e) {
            logger.error("Error getting reclamation stats for user {}: {}", userId, e.getMessage(), e);
            // Return empty stats on error
            return new StudentReclamationStatsDTO(userId, 0L, 0L, 0L, new HashMap<>(), new HashMap<>(), new HashMap<>());
        }
    }

    /**
     * Récupère le résumé du dashboard pour un étudiant
     * GET /api/dashboard/student/{userId}/summary
     */
    @GetMapping("/student/{userId}/summary")
    public Map<String, Object> getStudentSummary(@PathVariable Long userId) {
        logger.info("GET /api/dashboard/student/{}/summary", userId);
        
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Get feedback stats
            StudentFeedbackStatsDTO feedbackStats = feedbackService.getStudentFeedbackStats(userId);
            summary.put("feedbacks", feedbackStats);
            
            // Get reclamation stats
            StudentReclamationStatsDTO reclamationStats = reclamationService.getStudentReclamationStats(userId);
            summary.put("reclamations", reclamationStats);
            
            // Calculate overall satisfaction (simple metric)
            double satisfaction = 100.0;
            if (feedbackStats.getTotalFeedbacks() > 0) {
                satisfaction = (feedbackStats.getNoteMoyenne() / 5.0) * 100.0;
            }
            summary.put("satisfactionGlobale", satisfaction);
            
            return summary;
        } catch (Exception e) {
            logger.error("Error getting summary for user {}: {}", userId, e.getMessage(), e);
            summary.put("error", e.getMessage());
            return summary;
        }
    }
}

