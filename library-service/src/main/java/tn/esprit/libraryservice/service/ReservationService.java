package tn.esprit.libraryservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.libraryservice.entity.Book;
import tn.esprit.libraryservice.entity.Reservation;
import tn.esprit.libraryservice.entity.ReservationStatus;
import tn.esprit.libraryservice.repository.BookRepository;
import tn.esprit.libraryservice.repository.ReservationRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRepository bookRepository;

    public Reservation reserveBook(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId).orElseThrow();

        Reservation r = new Reservation();
        r.setBookId(bookId);
        r.setUserId(userId);
        r.setReservationDate(LocalDate.now());
        r.setReservationStatus(ReservationStatus.ACTIVE);

        return reservationRepository.save(r);
    }

    public Reservation cancelReservation(Long id) {
        Reservation r = reservationRepository.findById(id).orElseThrow();
        r.setReservationStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(r);
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getByUser(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public Reservation updateStatus(Long id, ReservationStatus newStatus) {
        Reservation r = reservationRepository.findById(id).orElseThrow();
        r.setReservationStatus(newStatus);
        return reservationRepository.save(r);
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
}
