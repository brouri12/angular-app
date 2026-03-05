package tn.esprit.abonnement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.abonnement.entity.HistoriqueAbonnement;

import java.util.List;

@Repository
public interface HistoriqueAbonnementRepository extends JpaRepository<HistoriqueAbonnement, Long> {
    
    // Recherche par email client
    @Query("SELECT h FROM HistoriqueAbonnement h WHERE h.email_client = :email")
    List<HistoriqueAbonnement> findByEmailClient(@Param("email") String email_client);
    
    // Recherche par statut
    @Query("SELECT h FROM HistoriqueAbonnement h WHERE h.statut = :statut")
    List<HistoriqueAbonnement> findByStatut(@Param("statut") String statut);
    
    // Recherche par nom client
    @Query("SELECT h FROM HistoriqueAbonnement h WHERE h.nom_client = :nom")
    List<HistoriqueAbonnement> findByNomClient(@Param("nom") String nom_client);
    
    // Recherche par référence de transaction
    @Query("SELECT h FROM HistoriqueAbonnement h WHERE h.reference_transaction = :ref")
    HistoriqueAbonnement findByReferenceTransaction(@Param("ref") String reference_transaction);
    
    // Recherche par type d'abonnement
    @Query("SELECT h FROM HistoriqueAbonnement h WHERE h.type_abonnement = :type")
    List<HistoriqueAbonnement> findByTypeAbonnement(@Param("type") String type_abonnement);
}
