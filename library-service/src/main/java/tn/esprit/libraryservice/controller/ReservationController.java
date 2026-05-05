package tn.esprit.libraryservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.libraryservice.entity.Reservation;
import tn.esprit.libraryservice.entity.ReservationStatus;
import tn.esprit.libraryservice.service.ReservationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/library/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping("/reserve/{bookId}/{userId}")
    public Reservation reserve(@PathVariable Long bookId,
                               @PathVariable Long userId) {
        return reservationService.reserveBook(bookId, userId);
    }

    @PostMapping("/cancel/{id}")
    public Reservation cancel(@PathVariable Long id) {
        return reservationService.cancelReservation(id);
    }

    @GetMapping
    public List<Reservation> all() {
        return reservationService.getAll();
    }

    @GetMapping("/all")
    public List<Reservation> getAllReservations() {
        return reservationService.getAll();
    }

    @PostMapping("/complete/{id}")
    public Reservation complete(@PathVariable Long id) {
        return reservationService.updateStatus(id, ReservationStatus.COMPLETED);
    }

    @GetMapping("/user/{userId}")
    public List<Reservation> byUser(@PathVariable Long userId) {
        return reservationService.getByUser(userId);
    }

    @PutMapping("/{id}/status")
    public Reservation updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ReservationStatus status = ReservationStatus.valueOf(body.get("status"));
        return reservationService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        reservationService.deleteReservation(id);
    }
}