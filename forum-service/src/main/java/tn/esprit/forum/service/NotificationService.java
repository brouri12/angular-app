package tn.esprit.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.forum.entity.NotificationForum;
import tn.esprit.forum.repository.NotificationForumRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {
    
    private final NotificationForumRepository notificationRepository;
    
    /**
     * Créer une notification
     */
    public NotificationForum creerNotification(NotificationForum notification) {
        log.info("🔔 Création d'une notification pour l'utilisateur {}", notification.getDestinataireId());
        
        notification.setDateCreation(LocalDateTime.now());
        notification.setLu(false);
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Obtenir toutes les notifications d'un utilisateur
     */
    public List<NotificationForum> getNotificationsUtilisateur(Long utilisateurId) {
        return notificationRepository.findByDestinataireIdOrderByDateCreationDesc(utilisateurId);
    }
    
    /**
     * Obtenir les notifications non lues
     */
    public List<NotificationForum> getNotificationsNonLues(Long utilisateurId) {
        return notificationRepository.findNotificationsNonLues(utilisateurId);
    }
    
    /**
     * Marquer une notification comme lue
     */
    public NotificationForum marquerCommeLue(Long notificationId) {
        log.info("✅ Marquage de la notification {} comme lue", notificationId);
        
        NotificationForum notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        
        notification.setLu(true);
        notification.setDateLecture(LocalDateTime.now());
        
        return notificationRepository.save(notification);
    }
    
    /**
     * Marquer toutes les notifications comme lues
     */
    public void marquerToutesCommeLues(Long utilisateurId) {
        log.info("✅ Marquage de toutes les notifications comme lues pour l'utilisateur {}", utilisateurId);
        
        List<NotificationForum> notifications = notificationRepository.findNotificationsNonLues(utilisateurId);
        
        for (NotificationForum notification : notifications) {
            notification.setLu(true);
            notification.setDateLecture(LocalDateTime.now());
        }
        
        notificationRepository.saveAll(notifications);
    }
    
    /**
     * Obtenir le nombre de notifications non lues
     */
    public Long getNombreNotificationsNonLues(Long utilisateurId) {
        return notificationRepository.countByDestinataireIdAndLu(utilisateurId, false);
    }
    
    /**
     * Supprimer une notification
     */
    public void supprimerNotification(Long notificationId, Long utilisateurId) {
        log.info("🗑️ Suppression de la notification {}", notificationId);
        
        NotificationForum notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        
        // Vérifier que c'est bien le destinataire
        if (!notification.getDestinataireId().equals(utilisateurId)) {
            throw new RuntimeException("Vous ne pouvez pas supprimer cette notification");
        }
        
        notificationRepository.delete(notification);
    }
}
