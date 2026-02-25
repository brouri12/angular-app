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
}
