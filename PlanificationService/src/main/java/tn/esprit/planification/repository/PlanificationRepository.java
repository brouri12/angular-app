package tn.esprit.planification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.planification.entity.Planification;
import tn.esprit.planification.enums.PlanificationType;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlanificationRepository extends JpaRepository<Planification, Long> {
    
    List<Planification> findByDate(LocalDate date);
    
    List<Planification> findByType(PlanificationType type);
    
    List<Planification> findBySalleIdSalle(Long salleId);
    
    List<Planification> findByGroupId(Long groupId);
    
    @Query("SELECT p FROM Planification p WHERE p.date BETWEEN :startDate AND :endDate")
    List<Planification> findByDateRange(@Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);
                                       
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN false ELSE true END FROM Planification p " +
           "WHERE p.group.teacherId = :teacherId AND p.date = :date " +
           "AND ((p.heureDebut < :endTime AND p.heureFin > :startTime))")
    boolean isTeacherAvailable(@Param("teacherId") Long teacherId, 
                             @Param("date") LocalDate date, 
                             @Param("startTime") java.time.LocalTime startTime, 
                             @Param("endTime") java.time.LocalTime endTime);
    
    @Query("SELECT p FROM Planification p " +
           "WHERE p.salle.idSalle = :salleId AND p.date = :date " +
           "AND ((p.heureDebut < :endTime AND p.heureFin > :startTime))")
    List<Planification> findBySalleAndDateAndTimeOverlap(@Param("salleId") Long salleId,
                                                         @Param("date") LocalDate date,
                                                         @Param("startTime") java.time.LocalTime startTime,
                                                         @Param("endTime") java.time.LocalTime endTime);
    
    @Query("SELECT p FROM Planification p " +
           "WHERE p.group.teacherId = :teacherId AND p.date = :date " +
           "AND ((p.heureDebut < :endTime AND p.heureFin > :startTime))")
    List<Planification> findByTeacherAndDateAndTimeOverlap(@Param("teacherId") Long teacherId,
                                                           @Param("date") LocalDate date,
                                                           @Param("startTime") java.time.LocalTime startTime,
                                                           @Param("endTime") java.time.LocalTime endTime);
}
