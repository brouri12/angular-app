package com.gestions.ramzi.servicefeedback.controllers;

import com.gestions.ramzi.servicefeedback.dto.ReclamationAnalytics;
import com.gestions.ramzi.servicefeedback.dto.ReclamationResponse;
import com.gestions.ramzi.servicefeedback.entities.CategorieReclamation;
import com.gestions.ramzi.servicefeedback.entities.Priorite;
import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import com.gestions.ramzi.servicefeedback.services.ReclamationService;
import com.gestions.ramzi.servicefeedback.services.ClassificationReclamationService;
import com.gestions.ramzi.servicefeedback.services.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
public class ReclamationController {

    private static final Logger logger = LoggerFactory.getLogger(ReclamationController.class);
    
    private final ReclamationService service;
    private final NotificationService notificationService;
    private final ClassificationReclamationService classificationService;

    public ReclamationController(ReclamationService service, NotificationService notificationService, ClassificationReclamationService classificationService) {
        this.service = service;
        this.notificationService = notificationService;
        this.classificationService = classificationService;
        logger.info("ReclamationController initialized with ClassificationService");
    }

    @GetMapping
    public List<Reclamation> getAll(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priorite) {
        logger.info("GET /api/reclamations - userId: {}, status: {}, priorite: {}", userId, status, priorite);
        if (userId != null) return service.getByUserId(userId);
        if (status != null) return service.getByStatus(status);
        if (priorite != null) return service.getByPriorite(Priorite.fromString(priorite));
        return service.getAll();
    }

    @GetMapping("/analytics")
    public ReclamationAnalytics getAnalytics(
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {
        logger.info("GET /api/reclamations/analytics - dateDebut: {}, dateFin: {}", dateDebut, dateFin);
        try {
            ReclamationAnalytics analytics = service.getAnalytics(dateDebut, dateFin);
            logger.info("Analytics retrieved: totalReclamations={}", analytics.getTotalReclamations());
            return analytics;
        } catch (Exception e) {
            logger.error("Error getting analytics: {}", e.getMessage(), e);
            throw e;
        }
    }

    // ==================== ROUTES SPÉCIFIQUES AVANT {id} ====================

    /**
     * NOUVEAU ENDPOINT - Récupérer TOUTES les réclamations AVEC les infos utilisateur
     * Appel: GET /api/reclamations/with-user
     */
    @GetMapping("/with-user")
    public List<ReclamationResponse> getAllWithUserInfo(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priorite) {
        logger.info("GET /api/reclamations/with-user - userId: {}, status: {}, priorite: {}", userId, status, priorite);
        
        if (userId != null) {
            return service.getByUserIdWithUserInfo(userId);
        }
        
        return service.getAllWithUserInfo();
    }

    @GetMapping("/{id}")
    public Reclamation getById(@PathVariable Long id) {
        logger.info("GET /api/reclamations/{}", id);
        return service.getById(id);
    }

    /**
     * NOUVEAU ENDPOINT - Récupérer UNE réclamation AVEC les infos utilisateur
     * Appel: GET /api/reclamations/{id}/with-user
     */
    @GetMapping("/{id}/with-user")
    public ReclamationResponse getByIdWithUserInfo(@PathVariable Long id) {
        logger.info("GET /api/reclamations/{}/with-user", id);
        return service.getByIdWithUserInfo(id);
    }

    @PostMapping
    public Reclamation create(@RequestBody Reclamation reclamation) {
        logger.info("POST /api/reclamations - objet: {}, priorite: {}", 
            reclamation.getObjet(), reclamation.getPriorite());
        
        if (reclamation.getPriorite() == null) {
            reclamation.setPriorite(Priorite.MOYENNE);
        }
        
        if (reclamation.getCategorie() == null) {
            CategorieReclamation categorieDetectee = classificationService.classifier(
                reclamation.getObjet(), 
                reclamation.getDescription()
            );
            reclamation.setCategorie(categorieDetectee);
            logger.info("🤖 Catégorie automatique détectée: {}", categorieDetectee);
        }
        
        Reclamation saved = service.create(reclamation);
        
        notificationService.notifierNouvelleReclamation(saved);
        
        if (saved.getPriorite() == Priorite.CRITIQUE || saved.getPriorite() == Priorite.HAUTE) {
            notificationService.notifierReclamationUrgente(saved);
        }
        
        return saved;
    }

    @PutMapping("/{id}")
    public Reclamation update(@PathVariable Long id, @RequestBody Reclamation reclamation) {
        logger.info("PUT /api/reclamations/{} - status: {}, priorite: {}", id, reclamation.getStatus(), reclamation.getPriorite());
        return service.update(id, reclamation);
    }

    @PutMapping("/{id}/status")
    public Reclamation updateStatus(@PathVariable Long id, @RequestParam(required = false) String status, @RequestBody(required = false) Reclamation body) {
        String newStatus = status;
        if (newStatus == null && body != null && body.getStatus() != null) {
            newStatus = body.getStatus();
        }
        if (newStatus == null) {
            newStatus = "EN_ATTENTE";
        }
        logger.info("PUT /api/reclamations/{}/status - status: {}", id, newStatus);
        Reclamation reclamation = service.updateStatus(id, newStatus);
        if ("RESOLUE".equals(newStatus) || "résolue".equalsIgnoreCase(newStatus)) {
            notificationService.notifierReclamationResolue(reclamation);
        }
        return reclamation;
    }

    @PutMapping("/{id}/priorite")
    public Reclamation updatePriorite(@PathVariable Long id, @RequestParam(required = false) String priorite, @RequestBody(required = false) Reclamation body) {
        String newPriorite = priorite;
        if (newPriorite == null && body != null && body.getPriorite() != null) {
            newPriorite = body.getPriorite().name();
        }
        if (newPriorite == null) {
            newPriorite = "MOYENNE";
        }
        logger.info("PUT /api/reclamations/{}/priorite - priorite: {}", id, newPriorite);
        Priorite prioriteEnum = Priorite.fromString(newPriorite);
        Reclamation reclamation = service.updatePriorite(id, prioriteEnum);
        if (reclamation != null && (reclamation.getPriorite() == Priorite.CRITIQUE || reclamation.getPriorite() == Priorite.HAUTE)) {
            notificationService.notifierReclamationUrgente(reclamation);
        }
        return reclamation;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        logger.info("DELETE /api/reclamations/{}", id);
        service.delete(id);
    }
}
