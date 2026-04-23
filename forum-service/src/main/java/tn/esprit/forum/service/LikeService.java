package tn.esprit.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.forum.entity.LikeMessage;
import tn.esprit.forum.entity.MessageForum;
import tn.esprit.forum.entity.NotificationForum;
import tn.esprit.forum.repository.LikeMessageRepository;
import tn.esprit.forum.repository.MessageForumRepository;
import tn.esprit.forum.repository.NotificationForumRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LikeService {
    
    private final LikeMessageRepository likeRepository;
    private final MessageForumRepository messageRepository;
    private final NotificationForumRepository notificationRepository;
    private final BadgeService badgeService;
    
    /**
     * Liker un message
     */
    public LikeMessage likerMessage(Long messageId, Long utilisateurId) {
        log.info("👍 Tentative de like du message {} par l'utilisateur {}", messageId, utilisateurId);
        
        // Vérifier si le message existe
        MessageForum message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        
        // Vérifier si l'utilisateur a déjà liké
        if (likeRepository.existsByMessageIdAndUtilisateurId(messageId, utilisateurId)) {
            throw new RuntimeException("Vous avez déjà liké ce message");
        }
        
        // Créer le like
        LikeMessage like = new LikeMessage();
        like.setMessageId(messageId);
        like.setUtilisateurId(utilisateurId);
        like.setDateLike(LocalDateTime.now());
        
        LikeMessage savedLike = likeRepository.save(like);
        
        // Créer une notification pour l'auteur du message (sauf si c'est lui-même)
        if (!message.getAuteurId().equals(utilisateurId)) {
            NotificationForum notification = new NotificationForum();
            notification.setDestinataireId(message.getAuteurId());
            notification.setType("LIKE");
            notification.setMessage("Quelqu'un a aimé votre message");
            notification.setMessageId(messageId);
            notification.setForumId(message.getForum().getId());
            notification.setDateCreation(LocalDateTime.now());
            notification.setLu(false);
            notificationRepository.save(notification);
        }
        
        // Mettre à jour les points de l'auteur du message
        badgeService.ajouterPoints(message.getAuteurId(), 5); // +5 points par like reçu
        
        log.info("✅ Like enregistré avec succès");
        return savedLike;
    }
    
    /**
     * Unliker un message
     */
    public void unlikerMessage(Long messageId, Long utilisateurId) {
        log.info("👎 Tentative d'unlike du message {} par l'utilisateur {}", messageId, utilisateurId);
        
        LikeMessage like = likeRepository.findByMessageIdAndUtilisateurId(messageId, utilisateurId)
            .orElseThrow(() -> new RuntimeException("Like non trouvé"));
        
        likeRepository.delete(like);
        
        // Retirer les points
        MessageForum message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        badgeService.retirerPoints(message.getAuteurId(), 5);
        
        log.info("✅ Unlike effectué avec succès");
    }
    
    /**
     * Obtenir le nombre de likes d'un message
     */
    public Long getNombreLikes(Long messageId) {
        return likeRepository.countByMessageId(messageId);
    }
    
    /**
     * Vérifier si un utilisateur a liké un message
     */
    public boolean aLike(Long messageId, Long utilisateurId) {
        return likeRepository.existsByMessageIdAndUtilisateurId(messageId, utilisateurId);
    }
    
    /**
     * Obtenir tous les likes d'un message
     */
    public List<LikeMessage> getLikesMessage(Long messageId) {
        return likeRepository.findByMessageId(messageId);
    }
}
