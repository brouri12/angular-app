package tn.esprit.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.forum.entity.MessageForum;
import tn.esprit.forum.entity.NotificationForum;
import tn.esprit.forum.entity.Signalement;
import tn.esprit.forum.repository.MessageForumRepository;
import tn.esprit.forum.repository.NotificationForumRepository;
import tn.esprit.forum.repository.SignalementRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SignalementService {
    
    private final SignalementRepository signalementRepository;
    private final MessageForumRepository messageRepository;
    private final NotificationForumRepository notificationRepository;
    
    /**
     * Créer un signalement
     */
    public Signalement creerSignalement(Signalement signalement) {
        log.info("🚨 Création d'un signalement pour le message {}", signalement.getMessageId());
        
        // Vérifier que le message existe
        MessageForum message = messageRepository.findById(signalement.getMessageId())
            .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        
        signalement.setDateSignalement(LocalDateTime.now());
        signalement.setStatut("EN_ATTENTE");
        
        Signalement savedSignalement = signalementRepository.save(signalement);
        
        // Si le message a 3 signalements ou plus, le modérer automatiquement
        Long nombreSignalements = signalementRepository.countByMessageIdAndStatut(
            signalement.getMessageId(), "EN_ATTENTE");
        
        if (nombreSignalements >= 3) {
            message.setStatut("MODERE");
            messageRepository.save(message);
            log.warn("⚠️ Message {} modéré automatiquement (3+ signalements)", message.getId());
        }
        
        log.info("✅ Signalement créé avec succès");
        return savedSignalement;
    }
    
    /**
     * Obtenir tous les signalements en attente
     */
    public List<Signalement> getSignalementsEnAttente() {
        return signalementRepository.findSignalementsEnAttente();
    }
    
    /**
     * Traiter un signalement (accepter ou rejeter)
     */
    public Signalement traiterSignalement(Long signalementId, Long moderateurId, 
                                         String decision, String commentaire) {
        log.info("⚖️ Traitement du signalement {} par le modérateur {}", signalementId, moderateurId);
        
        Signalement signalement = signalementRepository.findById(signalementId)
            .orElseThrow(() -> new RuntimeException("Signalement non trouvé"));
        
        if (!"EN_ATTENTE".equals(signalement.getStatut())) {
            throw new RuntimeException("Ce signalement a déjà été traité");
        }
        
        signalement.setStatut(decision); // "TRAITE" ou "REJETE"
        signalement.setTraitePar(moderateurId);
        signalement.setDateTraitement(LocalDateTime.now());
        signalement.setCommentaireModerateur(commentaire);
        
        // Si accepté, supprimer le message
        if ("TRAITE".equals(decision)) {
            MessageForum message = messageRepository.findById(signalement.getMessageId())
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));
            message.setStatut("SUPPRIME");
            messageRepository.save(message);
            
            // Notifier l'auteur du message
            NotificationForum notification = new NotificationForum();
            notification.setDestinataireId(message.getAuteurId());
            notification.setType("SIGNALEMENT");
            notification.setMessage("Votre message a été supprimé suite à un signalement : " + commentaire);
            notification.setMessageId(message.getId());
            notification.setForumId(message.getForum().getId());
            notification.setDateCreation(LocalDateTime.now());
            notification.setLu(false);
            notificationRepository.save(notification);
        }
        
        log.info("✅ Signalement traité avec succès");
        return signalementRepository.save(signalement);
    }
    
    /**
     * Obtenir les signalements d'un message
     */
    public List<Signalement> getSignalementsMessage(Long messageId) {
        return signalementRepository.findByMessageId(messageId);
    }
    
    /**
     * Obtenir les messages avec multiples signalements
     */
    public List<Object[]> getMessagesAvecMultiplesSignalements() {
        return signalementRepository.findMessagesAvecMultiplesSignalements();
    }
}
