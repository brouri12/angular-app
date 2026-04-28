package tn.esprit.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.forum.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyseService {
    
    private final ForumRepository forumRepository;
    private final MessageForumRepository messageRepository;
    private final LikeMessageRepository likeRepository;
    private final ReponseMessageRepository reponseRepository;
    private final BadgeUtilisateurRepository badgeRepository;
    
    /**
     * Obtenir le nombre de messages par forum
     */
    public Map<String, Object> getStatistiquesParForum() {
        log.info("📊 Génération des statistiques par forum");
        
        Map<String, Object> stats = new HashMap<>();
        
        forumRepository.findAll().forEach(forum -> {
            Map<String, Object> forumStats = new HashMap<>();
            forumStats.put("titre", forum.getTitre());
            forumStats.put("niveau", forum.getNiveau());
            forumStats.put("nombreMessages", forum.getMessages() != null ? forum.getMessages().size() : 0);
            forumStats.put("statut", forum.getStatut());
            
            stats.put(forum.getId().toString(), forumStats);
        });
        
        return stats;
    }
    
    /**
     * Obtenir le forum le plus actif
     */
    public Map<String, Object> getForumLePlusActif() {
        log.info("🏆 Recherche du forum le plus actif");
        
        return forumRepository.findAll().stream()
            .max(Comparator.comparingInt(f -> f.getMessages() != null ? f.getMessages().size() : 0))
            .map(forum -> {
                Map<String, Object> result = new HashMap<>();
                result.put("id", forum.getId());
                result.put("titre", forum.getTitre());
                result.put("niveau", forum.getNiveau());
                result.put("nombreMessages", forum.getMessages() != null ? forum.getMessages().size() : 0);
                return result;
            })
            .orElse(new HashMap<>());
    }
    
    /**
     * Obtenir l'étudiant le plus actif
     */
    public Map<String, Object> getEtudiantLePlusActif() {
        log.info("🌟 Recherche de l'étudiant le plus actif");
        
        return badgeRepository.findTopContributeurs().stream()
            .findFirst()
            .map(badge -> {
                Map<String, Object> result = new HashMap<>();
                result.put("utilisateurId", badge.getUtilisateurId());
                result.put("points", badge.getPoints());
                result.put("niveauBadge", badge.getNiveauBadge());
                result.put("nombreMessages", badge.getNombreMessages());
                result.put("nombreLikesRecus", badge.getNombreLikesRecus());
                result.put("nombreReponses", badge.getNombreReponses());
                return result;
            })
            .orElse(new HashMap<>());
    }
    
    /**
     * Obtenir le taux d'engagement par groupe
     */
    public Map<String, Object> getTauxEngagementParGroupe() {
        log.info("📈 Calcul du taux d'engagement par groupe");
        
        Map<String, Object> engagement = new HashMap<>();
        
        forumRepository.findAll().forEach(forum -> {
            String groupe = forum.getGroupe();
            int nombreMessages = forum.getMessages() != null ? forum.getMessages().size() : 0;
            
            if (engagement.containsKey(groupe)) {
                Map<String, Object> groupeStats = (Map<String, Object>) engagement.get(groupe);
                groupeStats.put("nombreMessages", 
                    (Integer) groupeStats.get("nombreMessages") + nombreMessages);
                groupeStats.put("nombreForums", 
                    (Integer) groupeStats.get("nombreForums") + 1);
            } else {
                Map<String, Object> groupeStats = new HashMap<>();
                groupeStats.put("nombreMessages", nombreMessages);
                groupeStats.put("nombreForums", 1);
                engagement.put(groupe, groupeStats);
            }
        });
        
        // Calculer le taux moyen
        engagement.forEach((groupe, stats) -> {
            Map<String, Object> groupeStats = (Map<String, Object>) stats;
            int nombreMessages = (Integer) groupeStats.get("nombreMessages");
            int nombreForums = (Integer) groupeStats.get("nombreForums");
            double tauxMoyen = nombreForums > 0 ? (double) nombreMessages / nombreForums : 0;
            groupeStats.put("tauxMoyen", tauxMoyen);
        });
        
        return engagement;
    }
    
    /**
     * Analyser les périodes d'activité
     */
    public Map<String, Object> getAnalysePeriodeActivite(LocalDate dateDebut, LocalDate dateFin) {
        log.info("📅 Analyse de l'activité entre {} et {}", dateDebut, dateFin);
        
        Map<String, Object> analyse = new HashMap<>();
        
        // Compter les messages par jour
        Map<String, Integer> messagesParJour = new HashMap<>();
        
        messageRepository.findAll().forEach(message -> {
            if (message.getDate_message() != null) {
                LocalDate date = message.getDate_message().toLocalDate();
                if (!date.isBefore(dateDebut) && !date.isAfter(dateFin)) {
                    String dateStr = date.toString();
                    messagesParJour.put(dateStr, messagesParJour.getOrDefault(dateStr, 0) + 1);
                }
            }
        });
        
        analyse.put("messagesParJour", messagesParJour);
        analyse.put("totalMessages", messagesParJour.values().stream().mapToInt(Integer::intValue).sum());
        analyse.put("jourLePlusActif", messagesParJour.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("Aucun"));
        
        return analyse;
    }
    
    /**
     * Obtenir les statistiques globales
     */
    public Map<String, Object> getStatistiquesGlobales() {
        log.info("🌍 Génération des statistiques globales");
        
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("nombreForums", forumRepository.count());
        stats.put("nombreMessages", messageRepository.count());
        stats.put("nombreLikes", likeRepository.count());
        stats.put("nombreReponses", reponseRepository.count());
        stats.put("nombreUtilisateurs", badgeRepository.count());
        
        // Top 5 contributeurs
        List<Map<String, Object>> topContributeurs = new ArrayList<>();
        badgeRepository.findTop10Contributeurs().stream()
            .limit(5)
            .forEach(badge -> {
                Map<String, Object> contributeur = new HashMap<>();
                contributeur.put("utilisateurId", badge.getUtilisateurId());
                contributeur.put("points", badge.getPoints());
                contributeur.put("niveauBadge", badge.getNiveauBadge());
                topContributeurs.add(contributeur);
            });
        stats.put("topContributeurs", topContributeurs);
        
        return stats;
    }
    
    /**
     * Obtenir les statistiques par niveau
     */
    public Map<String, Object> getStatistiquesParNiveau() {
        log.info("🎓 Génération des statistiques par niveau");
        
        Map<String, Object> stats = new HashMap<>();
        
        Arrays.asList("L1", "L2", "L3", "M1", "M2").forEach(niveau -> {
            Map<String, Object> niveauStats = new HashMap<>();
            
            long nombreForums = forumRepository.findAll().stream()
                .filter(f -> niveau.equals(f.getNiveau()))
                .count();
            
            long nombreMessages = forumRepository.findAll().stream()
                .filter(f -> niveau.equals(f.getNiveau()))
                .mapToLong(f -> f.getMessages() != null ? f.getMessages().size() : 0)
                .sum();
            
            niveauStats.put("nombreForums", nombreForums);
            niveauStats.put("nombreMessages", nombreMessages);
            
            stats.put(niveau, niveauStats);
        });
        
        return stats;
    }
}
