package tn.esprit.abonnement.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.abonnement.entity.Abonnement;

import java.util.List;

@Repository
public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    
    // Recherche par nom avec pagination
    @Query("SELECT a FROM Abonnement a WHERE LOWER(a.nom) LIKE LOWER(CONCAT('%', :nom, '%'))")
    Page<Abonnement> findByNomContaining(@Param("nom") String nom, Pageable pageable);
    
    // Recherche par statut
    @Query("SELECT a FROM Abonnement a WHERE a.statut = :statut")
    List<Abonnement> findByStatut(@Param("statut") String statut);
    
    // Recherche par prix inférieur ou égal
    @Query("SELECT a FROM Abonnement a WHERE a.prix <= :prix")
    List<Abonnement> findByPrixLessThanEqual(@Param("prix") Double prix);
    
    // ============ ANALYTICS QUERIES ============
    
    // Count total abonnements
    @Query("SELECT COUNT(a) FROM Abonnement a")
    Long countTotalAbonnements();
    
    // Count active abonnements
    @Query("SELECT COUNT(a) FROM Abonnement a WHERE a.statut = 'Active'")
    Long countActiveAbonnements();
    
    // Count abonnements by status
    @Query("SELECT a.statut, COUNT(a) FROM Abonnement a GROUP BY a.statut")
    List<Object[]> countByStatut();
    
    // Get most popular abonnement (by name, would need payment data for real popularity)
    @Query("SELECT a.nom, COUNT(a) FROM Abonnement a GROUP BY a.nom ORDER BY COUNT(a) DESC")
    List<Object[]> getMostPopularAbonnements();
    
    // Calculate average price
    @Query("SELECT AVG(a.prix) FROM Abonnement a WHERE a.statut = 'Active'")
    Double getAveragePrix();
    
    // Get total revenue potential (sum of all active subscription prices)
    @Query("SELECT SUM(a.prix) FROM Abonnement a WHERE a.statut = 'Active'")
    Double getTotalRevenuePotential();
    
    // Count by access level
    @Query("SELECT a.niveau_acces, COUNT(a) FROM Abonnement a WHERE a.statut = 'Active' GROUP BY a.niveau_acces")
    List<Object[]> countByNiveauAcces();
    
    // Get abonnements with priority support
    @Query("SELECT COUNT(a) FROM Abonnement a WHERE a.support_prioritaire = true AND a.statut = 'Active'")
    Long countWithPrioritySupport();
    
    // Get abonnements with unlimited access
    @Query("SELECT COUNT(a) FROM Abonnement a WHERE a.acces_illimite = true AND a.statut = 'Active'")
    Long countWithUnlimitedAccess();
}
