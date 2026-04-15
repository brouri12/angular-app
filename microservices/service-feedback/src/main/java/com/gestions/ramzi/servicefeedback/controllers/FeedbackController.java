package com.gestions.ramzi.servicefeedback.controllers;

import com.gestions.ramzi.servicefeedback.dto.FeedbackResponse;
import com.gestions.ramzi.servicefeedback.dto.FeedbackStats;
import com.gestions.ramzi.servicefeedback.dto.SentimentStatsDTO;
import com.gestions.ramzi.servicefeedback.entities.Feedback;
import com.gestions.ramzi.servicefeedback.services.FeedbackService;
import com.gestions.ramzi.servicefeedback.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService service;
    private final NotificationService notificationService;

    public FeedbackController(FeedbackService service, NotificationService notificationService) {
        this.service = service;
        this.notificationService = notificationService;
    }

    private static List<FeedbackResponse> toResponseList(List<Feedback> list) {
        return list.stream().map(FeedbackResponse::from).toList();
    }

    @GetMapping
    public List<FeedbackResponse> getAll(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long moduleId) {
        List<Feedback> list = userId != null ? service.getByUserId(userId)
            : moduleId != null ? service.getByModuleId(moduleId)
            : service.getAll();
        return toResponseList(list);
    }

    /**
     * NOUVEAU ENDPOINT - Récupérer TOUS les feedbacks AVEC les infos utilisateur
     * Appel: GET /api/feedbacks/with-user
     */
    @GetMapping("/with-user")
    public List<FeedbackResponse> getAllWithUserInfo() {
        return service.getAllWithUserInfo();
    }

    /**
     * NOUVEAU ENDPOINT - Récupérer UN feedback AVEC les infos utilisateur
     * Appel: GET /api/feedbacks/{id}/with-user
     */
    @GetMapping("/{id}/with-user")
    public FeedbackResponse getByIdWithUserInfo(@PathVariable Long id) {
        return service.getByIdWithUserInfo(id);
    }

    @GetMapping("/stats")
    public FeedbackStats getStats(@RequestParam(required = false) Long moduleId) {
        return service.getStats(moduleId);
    }

    /**
     * Endpoint pour les statistiques de sentiment des feedbacks
     */
    @GetMapping("/sentiment-stats")
    public SentimentStatsDTO getSentimentStats() {
        return service.getSentimentStats();
    }

    @GetMapping("/{id}")
    public FeedbackResponse getById(@PathVariable Long id) {
        return FeedbackResponse.from(service.getById(id));
    }

    @PostMapping
    public FeedbackResponse create(@Valid @RequestBody Feedback feedback) {
        Feedback saved = service.create(feedback);
        // Envoyer notification
        notificationService.notifierNouvelFeedback(saved);
        notificationService.notifierFeedbackNegatif(saved);
        return FeedbackResponse.from(saved);
    }

    @PutMapping("/{id}")
    public FeedbackResponse update(@PathVariable Long id, @Valid @RequestBody Feedback feedback) {
        return FeedbackResponse.from(service.update(id, feedback));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

