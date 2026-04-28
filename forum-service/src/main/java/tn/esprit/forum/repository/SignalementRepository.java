package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.Signalement;

import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    
    List<Signalement> findByStatut(String statut);
    
    List<Signalement> findByMessageId(Long messageId);
    
    Long countByMessageIdAndStatut(Long messageId, String statut);
    
    @Query("SELECT s FROM Signalement s WHERE s.statut = 'EN_ATTENTE' ORDER BY s.dateSignalement ASC")
    List<Signalement> findSignalementsEnAttente();
    
    @Query("SELECT s.messageId, COUNT(s) as count FROM Signalement s " +
           "WHERE s.statut = 'EN_ATTENTE' GROUP BY s.messageId HAVING COUNT(s) >= 3")
    List<Object[]> findMessagesAvecMultiplesSignalements();
}
