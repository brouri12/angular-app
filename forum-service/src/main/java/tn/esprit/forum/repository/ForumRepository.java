package tn.esprit.forum.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.Forum;

import java.util.List;

@Repository
public interface ForumRepository extends JpaRepository<Forum, Long> {
    
    List<Forum> findByStatut(String statut);
    
    List<Forum> findByNiveau(String niveau);
    
    @Query("SELECT f FROM Forum f WHERE LOWER(f.titre) LIKE LOWER(CONCAT('%', :titre, '%'))")
    Page<Forum> rechercherParTitre(@Param("titre") String titre, Pageable pageable);
    
    @Query("SELECT f FROM Forum f WHERE f.statut = 'OUVERT' ORDER BY SIZE(f.messages) DESC")
    List<Forum> findForumsPlusActifs(Pageable pageable);
}
