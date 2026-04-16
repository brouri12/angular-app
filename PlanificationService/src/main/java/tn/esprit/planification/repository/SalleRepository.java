package tn.esprit.planification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.planification.entity.Salle;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {
    
    Optional<Salle> findByNomSalle(String nomSalle);
    
    List<Salle> findByCapaciteGreaterThanEqual(Integer capacite);
    
    List<Salle> findByLocalisation(String localisation);
    
    // Check if room is available at specific date and time
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN false ELSE true END " +
           "FROM Planification p " +
           "WHERE p.salle.idSalle = :salleId " +
           "AND p.date = :date " +
           "AND ((p.heureDebut < :heureFin AND p.heureFin > :heureDebut))")
    boolean isSalleAvailable(@Param("salleId") Long salleId,
                            @Param("date") LocalDate date,
                            @Param("heureDebut") LocalTime heureDebut,
                            @Param("heureFin") LocalTime heureFin);
}
