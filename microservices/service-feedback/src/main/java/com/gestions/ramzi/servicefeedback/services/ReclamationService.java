package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.dto.ReclamationAnalytics;
import com.gestions.ramzi.servicefeedback.dto.ReclamationResponse;
import com.gestions.ramzi.servicefeedback.dto.StudentReclamationStatsDTO;
import com.gestions.ramzi.servicefeedback.dto.UserDTO;
import com.gestions.ramzi.servicefeedback.entities.Priorite;
import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import com.gestions.ramzi.servicefeedback.entities.ResolutionAction;
import com.gestions.ramzi.servicefeedback.repositories.ReclamationRepository;
import com.gestions.ramzi.servicefeedback.repositories.ResolutionActionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReclamationService {

    private static final Logger logger = LoggerFactory.getLogger(ReclamationService.class);

    private final ReclamationRepository repository;
    private final ResolutionActionRepository resolutionActionRepository;
    private final UserService userService;

    public ReclamationService(ReclamationRepository repository,
                              ResolutionActionRepository resolutionActionRepository,
                              UserService userService) {
        this.repository = repository;
        this.resolutionActionRepository = resolutionActionRepository;
        this.userService = userService;
    }

    public List<Reclamation> getAll() {
        return repository.findAll();
    }

    public Reclamation getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Reclamation create(Reclamation reclamation) {
        reclamation.setDate(LocalDateTime.now());
        reclamation.setStatus("en attente");
        if (reclamation.getPriorite() == null) {
            reclamation.setPriorite(Priorite.MOYENNE);
        }
        return repository.save(reclamation);
    }

    public Reclamation update(Long id, Reclamation reclamation) {
        Reclamation existing = getById(id);
        if (existing != null) {
            if (reclamation.getObjet() != null) {
                existing.setObjet(reclamation.getObjet());
            }
            if (reclamation.getDescription() != null) {
                existing.setDescription(reclamation.getDescription());
            }
            if (reclamation.getStatus() != null) {
                existing.setStatus(reclamation.getStatus());
            }
            if (reclamation.getPriorite() != null) {
                existing.setPriorite(reclamation.getPriorite());
            }
            return repository.save(existing);
        }
        return null;
    }

    public Reclamation updateStatus(Long id, String newStatus) {
        Reclamation existing = getById(id);
        if (existing != null) {
            existing.setStatus(newStatus);
            return repository.save(existing);
        }
        return null;
    }

    @Transactional
    public void delete(Long id) {
        resolutionActionRepository.findByReclamation_Id(id).forEach(resolutionActionRepository::delete);
        repository.deleteById(id);
    }

    public List<Reclamation> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public List<Reclamation> getByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<Reclamation> getByPriorite(Priorite priorite) {
        return repository.findAll().stream()
                .filter(r -> r.getPriorite() == priorite)
                .collect(Collectors.toList());
    }

    public Reclamation updatePriorite(Long id, Priorite priorite) {
        Reclamation existing = getById(id);
        if (existing != null) {
            existing.setPriorite(priorite);
            return repository.save(existing);
        }
        return null;
    }

    // ==================== NOUVELLES MÉTHODES POUR INTÉGRATION AVEC USER SERVICE ====================
    
    /**
     * Convertir Reclamation en ReclamationResponse avec infos utilisateur
     */
    private ReclamationResponse toResponseWithUser(Reclamation reclamation) {
        ReclamationResponse response = ReclamationResponse.builder()
                .id(reclamation.getId())
                .userId(reclamation.getUserId())
                .objet(reclamation.getObjet())
                .description(reclamation.getDescription())
                .status(reclamation.getStatus())
                .date(reclamation.getDate())
                .priorite(reclamation.getPriorite())
                .categorie(reclamation.getCategorie())
                .build();
        
        // Récupérer les infos utilisateur via Feign Client
        if (reclamation.getUserId() != null) {
            try {
                UserDTO user = userService.getUserById(reclamation.getUserId());
                response.setUser(user);
            } catch (Exception e) {
                logger.warn("Impossible de récupérer l'utilisateur {} pour la réclamation {}: {}", 
                    reclamation.getUserId(), reclamation.getId(), e.getMessage());
                response.setUser(null);
            }
        }
        
        return response;
    }

    /**
     * NOUVELLE MÉTHODE - Récupérer TOUTES les réclamations AVEC les infos utilisateur
     */
    public List<ReclamationResponse> getAllWithUserInfo() {
        List<Reclamation> reclamations = repository.findAll();
        logger.info("Récupération de {} réclamations avec infos utilisateur", reclamations.size());
        return reclamations.stream()
                .map(this::toResponseWithUser)
                .collect(Collectors.toList());
    }

    /**
     * NOUVELLE MÉTHODE - Récupérer UNE réclamation AVEC les infos utilisateur
     */
    public ReclamationResponse getByIdWithUserInfo(Long id) {
        Reclamation reclamation = getById(id);
        if (reclamation == null) {
            return null;
        }
        return toResponseWithUser(reclamation);
    }

    /**
     * NOUVELLE MÉTHODE - Récupérer les réclamations d'un utilisateur AVEC les infos utilisateur
     */
    public List<ReclamationResponse> getByUserIdWithUserInfo(Long userId) {
        List<Reclamation> reclamations = repository.findByUserId(userId);
        return reclamations.stream()
                .map(this::toResponseWithUser)
                .collect(Collectors.toList());
    }

    // ==================== ANALYTICS ====================

    public ReclamationAnalytics getAnalytics(String dateDebut, String dateFin) {
        List<Reclamation> reclamations = repository.findAll();

        if (reclamations.isEmpty()) {
            return ReclamationAnalytics.builder()
                    .totalReclamations(0)
                    .parStatus(new HashMap<>())
                    .tempsResolutionMoyen(0.0)
                    .parMois(new HashMap<>())
                    .nonResolues(new ArrayList<>())
                    .reclamationEnAttente(0)
                    .reclamationResolue(0)
                    .build();
        }

        Map<String, Long> parStatus = reclamations.stream()
                .collect(Collectors.groupingBy(Reclamation::getStatus, Collectors.counting()));

        long enAttente = reclamations.stream()
                .filter(r -> "en attente".equalsIgnoreCase(r.getStatus()))
                .count();
        long resolue = reclamations.stream()
                .filter(r -> "résolue".equalsIgnoreCase(r.getStatus()) || "resolue".equalsIgnoreCase(r.getStatus()) || "resolved".equalsIgnoreCase(r.getStatus()))
                .count();

        List<ResolutionAction> resolutions = resolutionActionRepository.findAll();
        double tempsResolutionMoyen = 0.0;
        if (!resolutions.isEmpty()) {
            tempsResolutionMoyen = resolutions.stream()
                    .filter(r -> r.getDateAction() != null && r.getReclamation() != null && r.getReclamation().getDate() != null)
                    .mapToLong(r -> java.time.Duration.between(r.getReclamation().getDate(), r.getDateAction()).toHours())
                    .average()
                    .orElse(0.0);
        }

        Map<String, Long> parMois = reclamations.stream()
                .filter(r -> r.getDate() != null)
                .filter(r -> r.getDate().isAfter(LocalDateTime.now().minusMonths(6)))
                .collect(Collectors.groupingBy(
                        r -> r.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM")),
                        Collectors.counting()
                ));

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Reclamation> nonResolues = reclamations.stream()
                .filter(r -> r.getDate() != null)
                .filter(r -> r.getDate().isBefore(sevenDaysAgo))
                .filter(r -> !"résolue".equalsIgnoreCase(r.getStatus()) && !"resolue".equalsIgnoreCase(r.getStatus()) && !"resolved".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        return ReclamationAnalytics.builder()
                .totalReclamations(reclamations.size())
                .parStatus(parStatus)
                .tempsResolutionMoyen(Math.round(tempsResolutionMoyen * 100.0) / 100.0)
                .parMois(parMois)
                .nonResolues(nonResolues)
                .reclamationEnAttente(enAttente)
                .reclamationResolue(resolue)
                .build();
    }

    /**
     * Get student reclamation statistics for dashboard
     * @param userId the student ID
     * @return StudentReclamationStatsDTO with personal statistics
     */
    public StudentReclamationStatsDTO getStudentReclamationStats(Long userId) {
        List<Reclamation> reclamations = repository.findByUserId(userId);
        
        if (reclamations.isEmpty()) {
            return new StudentReclamationStatsDTO(userId, 0L, 0L, 0L, new HashMap<>(), new HashMap<>(), new HashMap<>());
        }
        
        // Count by status
        Map<String, Long> reclamationsParStatut = reclamations.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus() != null ? r.getStatus() : "en attente",
                        Collectors.counting()
                ));
        
        // Count by priority
        Map<String, Long> reclamationsParPriorite = reclamations.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getPriorite() != null ? r.getPriorite().name() : "MOYENNE",
                        Collectors.counting()
                ));
        
        // Count by category
        Map<String, Long> reclamationsParCategorie = reclamations.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getCategorie() != null ? r.getCategorie().name() : "AUTRE",
                        Collectors.counting()
                ));
        
        long enAttente = reclamations.stream()
                .filter(r -> "en attente".equalsIgnoreCase(r.getStatus()))
                .count();
        
        long resolue = reclamations.stream()
                .filter(r -> "résolue".equalsIgnoreCase(r.getStatus()) || "resolue".equalsIgnoreCase(r.getStatus()) || "resolved".equalsIgnoreCase(r.getStatus()))
                .count();
        
        return new StudentReclamationStatsDTO(
                userId,
                (long) reclamations.size(),
                enAttente,
                resolue,
                reclamationsParStatut,
                reclamationsParPriorite,
                reclamationsParCategorie
        );
    }
}
