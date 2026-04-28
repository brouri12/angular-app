package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.ReponseMessage;

import java.util.List;

@Repository
public interface ReponseMessageRepository extends JpaRepository<ReponseMessage, Long> {
    
    List<ReponseMessage> findByMessageParentIdAndStatut(Long messageParentId, String statut);
    
    List<ReponseMessage> findByAuteurId(Long auteurId);
    
    Long countByMessageParentId(Long messageParentId);
    
    @Query("SELECT COUNT(r) FROM ReponseMessage r WHERE r.messageParentId IN " +
           "(SELECT m.id FROM MessageForum m WHERE m.auteurId = :auteurId) AND r.statut = 'ACTIF'")
    Long countReponsesRecuesByAuteur(@Param("auteurId") Long auteurId);
    
    @Query("SELECT COUNT(r) FROM ReponseMessage r WHERE r.auteurId = :auteurId AND r.statut = 'ACTIF'")
    Long countReponsesByAuteur(@Param("auteurId") Long auteurId);
}
