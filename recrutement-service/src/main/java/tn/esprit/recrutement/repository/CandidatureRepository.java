package tn.esprit.recrutement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.recrutement.entity.CandidatureEnseignant;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatureRepository extends JpaRepository<CandidatureEnseignant, Long> {

    Optional<CandidatureEnseignant> findByEmail(String email);

    List<CandidatureEnseignant> findByStatut(String statut);

    boolean existsByEmailAndOffreId(String email, Long offreId);

    List<CandidatureEnseignant> findByOffreId(Long offreId);

    // Métier 1 : Détection doublon — même email, même spécialité, dans les 30 derniers jours
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM CandidatureEnseignant c " +
           "WHERE c.email = :email AND c.offre.specialite = :specialite AND c.date_candidature > :date")
    boolean existsDoublon(@Param("email") String email,
                          @Param("specialite") String specialite,
                          @Param("date") LocalDate date);
}
