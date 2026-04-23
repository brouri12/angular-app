package tn.esprit.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.forum.entity.BadgeUtilisateur;
import tn.esprit.forum.entity.NotificationForum;
import tn.esprit.forum.repository.BadgeUtilisateurRepository;
import tn.esprit.forum.repository.LikeMessageRepository;
import tn.esprit.forum.repository.NotificationForumRepository;
import tn.esprit.forum.repository.ReponseMessageRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BadgeService {
    
    private final BadgeUtilisateurRepository badgeRepository;
    private final LikeMessageRepository likeRepository;
    private final ReponseMessageRepository reponseRepository;
    private final NotificationForumRepository notificationRepository;
    
    /**
     * Obtenir ou créer le badge d'un utilisateur
     */
    public BadgeUtilisateur getOrCreateBadge(Long utilisateurId) {
        return badgeRepository.findByUtilisateurId(utilisateurId)
            .orElseGet(() -> {
                BadgeUtilisateur badge = new BadgeUtilisateur();
                badge.setUtilisateurId(utilisateurId);
                badge.setPoints(0);
                badge.setNiveauBadge("BRONZE");
                badge.setNombreMessages(0);
                badge.setNombreLikesRecus(0);
                badge.setNombreReponses(0);
                badge.setDerniereMiseAJour(LocalDateTime.now());
                return badgeRepository.save(badge);
            });
    }
    
    /**
     * Ajouter des points à un utilisateur
     */
    public void ajouterPoints(Long utilisateurId, Integer points) {
        log.info("⭐ Ajout de {} points à l'utilisateur {}", points, utilisateurId);
        
        BadgeUtilisateur badge = getOrCreateBadge(utilisateurId);
        String ancienNiveau = badge.getNiveauBadge();
        
        badge.setPoints(badge.getPoints() + points);
        badge.setDerniereMiseAJour(LocalDateTime.now());
        
        badgeRepository.save(badge);
        
        // Vérifier si le niveau a changé
        if (!ancienNiveau.equals(badge.getNiveauBadge())) {
            log.info("🎉 L'utilisateur {} a atteint le niveau {}", utilisateurId, badge.getNiveauBadge());
            
            // Créer une notification
            NotificationForum notification = new NotificationForum();
            notification.setDestinataireId(utilisateurId);
            notification.setType("BADGE");
            notification.setMessage("Félicitations ! Vous avez atteint le niveau " + badge.getNiveauBadge());
            notification.setDateCreation(LocalDateTime.now());
            notification.setLu(false);
            notificationRepository.save(notification);
        }
    }
    
    /**
     * Retirer des points à un utilisateur
     */
    public void retirerPoints(Long utilisateurId, Integer points) {
        log.info("➖ Retrait de {} points à l'utilisateur {}", points, utilisateurId);
        
        BadgeUtilisateur badge = getOrCreateBadge(utilisateurId);
        badge.setPoints(Math.max(0, badge.getPoints() - points));
        badge.setDerniereMiseAJour(LocalDateTime.now());
        
        badgeRepository.save(badge);
    }
    
    /**
     * Incrémenter le nombre de messages
     */
    public void incrementerMessages(Long utilisateurId) {
        BadgeUtilisateur badge = getOrCreateBadge(utilisateurId);
        badge.setNombreMessages(badge.getNombreMessages() + 1);
        badge.setDerniereMiseAJour(LocalDateTime.now());
        badgeRepository.save(badge);
    }
    
    /**
     * Incrémenter le nombre de réponses
     */
    public void incrementerReponses(Long utilisateurId) {
        BadgeUtilisateur badge = getOrCreateBadge(utilisateurId);
        badge.setNombreReponses(badge.getNombreReponses() + 1);
        badge.setDerniereMiseAJour(LocalDateTime.now());
        badgeRepository.save(badge);
    }
    
    /**
     * Mettre à jour les statistiques complètes d'un utilisateur
     */
    public BadgeUtilisateur mettreAJourStatistiques(Long utilisateurId) {
        log.info("🔄 Mise à jour des statistiques de l'utilisateur {}", utilisateurId);
        
        BadgeUtilisateur badge = getOrCreateBadge(utilisateurId);
        
        // Compter les likes reçus
        Long likesRecus = likeRepository.countLikesRecusByAuteur(utilisateurId);
        badge.setNombreLikesRecus(likesRecus.intValue());
        
        // Compter les réponses données
        Long reponses = reponseRepository.countReponsesByAuteur(utilisateurId);
        badge.setNombreReponses(reponses.intValue());
        
        badge.setDerniereMiseAJour(LocalDateTime.now());
        
        return badgeRepository.save(badge);
    }
    
    /**
     * Obtenir le top 10 des contributeurs
     */
    public List<BadgeUtilisateur> getTopContributeurs() {
        return badgeRepository.findTop10Contributeurs();
    }
    
    /**
     * Obtenir le badge d'un utilisateur
     */
    public BadgeUtilisateur getBadgeUtilisateur(Long utilisateurId) {
        return getOrCreateBadge(utilisateurId);
    }
    
    /**
     * Obtenir tous les badges par niveau
     */
    public List<BadgeUtilisateur> getBadgesByNiveau(String niveau) {
        return badgeRepository.findByNiveauBadge(niveau);
    }
}
