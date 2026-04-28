package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.BadgeUtilisateur;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeUtilisateurRepository extends JpaRepository<BadgeUtilisateur, Long> {
    
    Optional<BadgeUtilisateur> findByUtilisateurId(Long utilisateurId);
    
    @Query("SELECT b FROM BadgeUtilisateur b ORDER BY b.points DESC")
    List<BadgeUtilisateur> findTopContributeurs();
    
    @Query("SELECT b FROM BadgeUtilisateur b WHERE b.niveauBadge = :niveau ORDER BY b.points DESC")
    List<BadgeUtilisateur> findByNiveauBadge(String niveau);
    
    @Query("SELECT b FROM BadgeUtilisateur b ORDER BY b.points DESC LIMIT 10")
    List<BadgeUtilisateur> findTop10Contributeurs();
}
