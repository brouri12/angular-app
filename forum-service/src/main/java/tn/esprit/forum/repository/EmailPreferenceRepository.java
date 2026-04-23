package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.EmailPreference;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailPreferenceRepository extends JpaRepository<EmailPreference, Long> {
    
    // Recherche par utilisateur
    Optional<EmailPreference> findByUserId(Long userId);
    
    // Utilisateurs avec toutes notifications activées
    @Query("SELECT e FROM EmailPreference e WHERE e.welcomeEmails = true AND e.replyNotifications = true " +
           "AND e.weeklyDigests = true AND e.mentionAlerts = true AND e.unsubscribeAll = false")
    List<EmailPreference> findUsersWithAllNotificationsEnabled();
    
    // Utilisateurs désabonnés de tout
    List<EmailPreference> findByUnsubscribeAllTrue();
    
    // Utilisateurs abonnés aux digests hebdomadaires
    @Query("SELECT e FROM EmailPreference e WHERE e.weeklyDigests = true AND e.unsubscribeAll = false")
    List<EmailPreference> findUsersSubscribedToWeeklyDigests();
    
    // Utilisateurs abonnés aux résumés quotidiens
    @Query("SELECT e FROM EmailPreference e WHERE e.dailySummaries = true AND e.unsubscribeAll = false")
    List<EmailPreference> findUsersSubscribedToDailySummaries();
    
    // Utilisateurs abonnés aux notifications de réponse
    @Query("SELECT e FROM EmailPreference e WHERE e.replyNotifications = true AND e.unsubscribeAll = false")
    List<EmailPreference> findUsersSubscribedToReplyNotifications();
    
    // Utilisateurs abonnés aux alertes de mention
    @Query("SELECT e FROM EmailPreference e WHERE e.mentionAlerts = true AND e.unsubscribeAll = false")
    List<EmailPreference> findUsersSubscribedToMentionAlerts();
    
    // Utilisateurs abonnés aux rappels
    @Query("SELECT e FROM EmailPreference e WHERE e.unreadReminders = true AND e.unsubscribeAll = false")
    List<EmailPreference> findUsersSubscribedToReminders();
    
    // Vérifier si un utilisateur est abonné à un type spécifique
    @Query("SELECT CASE " +
           "WHEN :emailType = 'WELCOME' THEN e.welcomeEmails " +
           "WHEN :emailType = 'REPLY' THEN e.replyNotifications " +
           "WHEN :emailType = 'MENTION' THEN e.mentionAlerts " +
           "WHEN :emailType = 'DIGEST' THEN e.weeklyDigests " +
           "WHEN :emailType = 'SUMMARY' THEN e.dailySummaries " +
           "WHEN :emailType = 'REMINDER' THEN e.unreadReminders " +
           "ELSE false END " +
           "FROM EmailPreference e WHERE e.userId = :userId AND e.unsubscribeAll = false")
    Boolean isUserSubscribedToEmailType(@Param("userId") Long userId, @Param("emailType") String emailType);
    
    // Compter utilisateurs par type de préférence
    @Query("SELECT " +
           "SUM(CASE WHEN e.welcomeEmails = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN e.replyNotifications = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN e.weeklyDigests = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN e.mentionAlerts = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN e.dailySummaries = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN e.unreadReminders = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN e.unsubscribeAll = true THEN 1 ELSE 0 END) " +
           "FROM EmailPreference e")
    Object[] getPreferenceStatistics();
}
