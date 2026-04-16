package tn.esprit.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.eventservice.entity.Event;

import java.util.Date;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    Event findByTitle(String title);

    List<Event> findByEventDate(Date eventDate);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE Event e SET e.capacity = e.capacity - 1 WHERE e.idEvent = :id AND e.capacity > 0")
    int decrementCapacity(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("UPDATE Event e SET e.capacity = e.capacity + 1 WHERE e.idEvent = :id")
    int incrementCapacity(@Param("id") Long id);

    // ✅ STATS (sans DTO)
    @Query("SELECT e.status, COUNT(e) FROM Event e GROUP BY e.status")
    List<Object[]> countByStatus();

    @Query("SELECT e.type, COUNT(e) FROM Event e GROUP BY e.type")
    List<Object[]> countByType();

    @Query("SELECT e.mode, COUNT(e) FROM Event e GROUP BY e.mode")
    List<Object[]> countByMode();

    @Query("SELECT COUNT(e) FROM Event e")
    Long countAll();

    // ✅ Events sponsorisés dont le sponsoring a expiré (sponsoredAt < :expiry)
    @Query("SELECT e FROM Event e WHERE e.sponsorClubId IS NOT NULL AND e.sponsoredAt IS NOT NULL AND e.sponsoredAt < :expiry")
    List<Event> findExpiredSponsorships(@Param("expiry") Date expiry);
}