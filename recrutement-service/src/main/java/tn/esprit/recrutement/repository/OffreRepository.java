package tn.esprit.recrutement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.recrutement.entity.OffreRecrutement;

import java.util.List;

@Repository
public interface OffreRepository extends JpaRepository<OffreRecrutement, Long> {
    
    List<OffreRecrutement> findByStatut(String statut);
    
    List<OffreRecrutement> findBySpecialite(String specialite);
}
