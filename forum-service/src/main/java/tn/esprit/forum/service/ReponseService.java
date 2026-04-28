package tn.esprit.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.forum.entity.MessageForum;
import tn.esprit.forum.entity.NotificationForum;
import tn.esprit.forum.entity.ReponseMessage;
import tn.esprit.forum.repository.MessageForumRepository;
import tn.esprit.forum.repository.NotificationForumRepository;
import tn.esprit.forum.repository.ReponseMessageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReponseService {
    
    private final ReponseMessageRepository reponseRepository;
    private final MessageForumRepository messageRepository;
    private final NotificationForumRepository notificationRepository;
    private final BadgeService badgeService;
    
    /**
     * Créer une réponse à un message
     */
    public ReponseMessage creerReponse(ReponseMessage reponse) {
        log.info("💬 Création d'une réponse au message {}", reponse.getMessageParentId());
        
        // Vérifier que le message parent existe
        MessageForum messageParent = messageRepository.findById(reponse.getMessageParentId())
            .orElseThrow(() -> new RuntimeException("Message parent non trouvé"));
        
        // Vérifier que le forum n'est pas fermé
        if ("FERME".equals(messageParent.getForum().getStatut())) {
            throw new RuntimeException("Impossible de répondre : le forum est fermé");
        }
        
        reponse.setDateReponse(LocalDateTime.now());
        reponse.setStatut("ACTIF");
        
        ReponseMessage savedReponse = reponseRepository.save(reponse);
        
        // Créer une notification pour l'auteur du message parent
        if (!messageParent.getAuteurId().equals(reponse.getAuteurId())) {
            NotificationForum notification = new NotificationForum();
            notification.setDestinataireId(messageParent.getAuteurId());
            notification.setType("REPONSE");
            notification.setMessage("Quelqu'un a répondu à votre message");
            notification.setMessageId(messageParent.getId());
            notification.setForumId(messageParent.getForum().getId());
            notification.setDateCreation(LocalDateTime.now());
            notification.setLu(false);
            notificationRepository.save(notification);
        }
        
        // Ajouter des points à l'auteur de la réponse
        badgeService.ajouterPoints(reponse.getAuteurId(), 3); // +3 points par réponse
        badgeService.incrementerReponses(reponse.getAuteurId());
        
        log.info("✅ Réponse créée avec succès");
        return savedReponse;
    }
    
    /**
     * Obtenir toutes les réponses d'un message
     */
    public List<ReponseMessage> getReponsesMessage(Long messageId) {
        return reponseRepository.findByMessageParentIdAndStatut(messageId, "ACTIF");
    }
    
    /**
     * Modifier une réponse (seul l'auteur peut modifier)
     */
    public ReponseMessage modifierReponse(Long reponseId, String nouveauContenu, Long utilisateurId) {
        log.info("✏️ Modification de la réponse {} par l'utilisateur {}", reponseId, utilisateurId);
        
        ReponseMessage reponse = reponseRepository.findById(reponseId)
            .orElseThrow(() -> new RuntimeException("Réponse non trouvée"));
        
        // Vérifier que c'est bien l'auteur
        if (!reponse.getAuteurId().equals(utilisateurId)) {
            throw new RuntimeException("Seul l'auteur peut modifier sa réponse");
        }
        
        reponse.setContenu(nouveauContenu);
        return reponseRepository.save(reponse);
    }
    
    /**
     * Supprimer une réponse (seul l'auteur ou un modérateur)
     */
    public void supprimerReponse(Long reponseId, Long utilisateurId, String typeUtilisateur) {
        log.info("🗑️ Suppression de la réponse {} par l'utilisateur {}", reponseId, utilisateurId);
        
        ReponseMessage reponse = reponseRepository.findById(reponseId)
            .orElseThrow(() -> new RuntimeException("Réponse non trouvée"));
        
        // Vérifier les droits
        if (!reponse.getAuteurId().equals(utilisateurId) && 
            !"ENSEIGNANT".equals(typeUtilisateur) && 
            !"ADMIN".equals(typeUtilisateur)) {
            throw new RuntimeException("Vous n'avez pas les droits pour supprimer cette réponse");
        }
        
        reponse.setStatut("SUPPRIME");
        reponseRepository.save(reponse);
        
        // Retirer les points
        badgeService.retirerPoints(reponse.getAuteurId(), 3);
        
        log.info("✅ Réponse supprimée avec succès");
    }
    
    /**
     * Obtenir le nombre de réponses d'un message
     */
    public Long getNombreReponses(Long messageId) {
        return reponseRepository.countByMessageParentId(messageId);
    }
}
