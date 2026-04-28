package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.MessageForum;

import java.util.List;

@Repository
public interface MessageForumRepository extends JpaRepository<MessageForum, Long> {
    
    List<MessageForum> findByForumId(Long forumId);

    List<MessageForum> findByAuteurId(Long auteurId);
    
    List<MessageForum> findByStatut(String statut);
    
    @Query("SELECT COUNT(m) FROM MessageForum m WHERE m.forum.id = :forumId AND m.statut = 'ACTIF'")
    Long compterMessagesParForum(@Param("forumId") Long forumId);
    
    @Query("SELECT m FROM MessageForum m WHERE LOWER(m.contenu) LIKE LOWER(CONCAT('%', :keyword, '%')) AND m.statut = 'ACTIF'")
    List<MessageForum> rechercherParMotCle(@Param("keyword") String keyword);
}
