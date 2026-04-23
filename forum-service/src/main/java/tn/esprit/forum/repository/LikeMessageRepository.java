package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.LikeMessage;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeMessageRepository extends JpaRepository<LikeMessage, Long> {
    
    Optional<LikeMessage> findByMessageIdAndUtilisateurId(Long messageId, Long utilisateurId);
    
    List<LikeMessage> findByMessageId(Long messageId);
    
    Long countByMessageId(Long messageId);
    
    @Query("SELECT COUNT(l) FROM LikeMessage l WHERE l.messageId IN " +
           "(SELECT m.id FROM MessageForum m WHERE m.auteurId = :auteurId)")
    Long countLikesRecusByAuteur(@Param("auteurId") Long auteurId);
    
    boolean existsByMessageIdAndUtilisateurId(Long messageId, Long utilisateurId);
}
