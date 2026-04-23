package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.EmailLog;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    
    // Recherches de base
    List<EmailLog> findByUserId(Long userId);
    List<EmailLog> findByEmailType(String emailType);
    List<EmailLog> findBySentDateBetween(LocalDateTime start, LocalDateTime end);
    
    // Recherche par utilisateur et type
    @Query("SELECT e FROM EmailLog e WHERE e.userId = :userId AND e.emailType = :emailType ORDER BY e.sentDate DESC")
    List<EmailLog> findByUserIdAndEmailType(@Param("userId") Long userId, @Param("emailType") String emailType);
    
    // Emails échoués
    List<EmailLog> findBySuccessFalse();
    
    // Emails échoués par utilisateur
    @Query("SELECT e FROM EmailLog e WHERE e.userId = :userId AND e.success = false ORDER BY e.sentDate DESC")
    List<EmailLog> findFailedEmailsByUserId(@Param("userId") Long userId);
    
    // Emails nécessitant retry
    @Query("SELECT e FROM EmailLog e WHERE e.success = false AND e.retryCount < :maxRetries")
    List<EmailLog> findEmailsNeedingRetry(@Param("maxRetries") int maxRetries);
    
    // Statistiques d'envoi par type
    @Query("SELECT e.emailType, COUNT(e), SUM(CASE WHEN e.success = true THEN 1 ELSE 0 END) FROM EmailLog e GROUP BY e.emailType")
    List<Object[]> getEmailStatsByType();
    
    // Taux de succès par utilisateur
    @Query("SELECT e.userId, COUNT(e), SUM(CASE WHEN e.success = true THEN 1 ELSE 0 END) FROM EmailLog e WHERE e.userId = :userId GROUP BY e.userId")
    Object[] getSuccessRateByUserId(@Param("userId") Long userId);
    
    // Derniers emails envoyés
    @Query("SELECT e FROM EmailLog e ORDER BY e.sentDate DESC")
    List<EmailLog> findRecentEmails();
    
    // Emails par période et type
    @Query("SELECT e FROM EmailLog e WHERE e.emailType = :emailType AND e.sentDate BETWEEN :start AND :end")
    List<EmailLog> findByTypeAndDateRange(
        @Param("emailType") String emailType,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
    
    // Compter emails envoyés aujourd'hui pour un utilisateur
    @Query("SELECT COUNT(e) FROM EmailLog e WHERE e.userId = :userId AND DATE(e.sentDate) = CURRENT_DATE")
    Long countTodayEmailsByUserId(@Param("userId") Long userId);
    
    // Emails avec erreurs spécifiques
    @Query("SELECT e FROM EmailLog e WHERE e.success = false AND e.errorMessage LIKE %:errorPattern%")
    List<EmailLog> findByErrorPattern(@Param("errorPattern") String errorPattern);
}
