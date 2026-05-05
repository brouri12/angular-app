package tn.esprit.libraryservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.libraryservice.entity.Reservation;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByBookId(Long bookId);
}
