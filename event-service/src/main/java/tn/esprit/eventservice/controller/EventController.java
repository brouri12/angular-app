package tn.esprit.eventservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.eventservice.entity.Event;
import tn.esprit.eventservice.service.EventService;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:4201"
})
@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // ✅ GET /events
    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    // ✅ GET /events/{id}
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Optional<Event> event = eventService.getEventById(id);
        return event.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ POST /events
    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        Event created = eventService.createEvent(event);
        return ResponseEntity.ok(created);
    }

    // ✅ PUT /events/{id}
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody Event event) {
        Optional<Event> updated = eventService.updateEvent(id, event);
        return updated.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ DELETE /events/{id}
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteEventById(@PathVariable Long id) {
        boolean isDeleted = eventService.deleteEventById(id);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // ✅ DELETE /events/by-title?title=xxx
    @DeleteMapping("/by-title")
    public ResponseEntity<Void> deleteEventByTitle(@RequestParam String title) {
        boolean isDeleted = eventService.deleteEventByTitle(title);
        return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // ✅ DELETE /events/by-date?eventDate=2026-02-15
    @DeleteMapping("/by-date")
    public ResponseEntity<Void> deleteEventByDate(@RequestParam String eventDate) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date parsedDate = sdf.parse(eventDate);

            boolean isDeleted = eventService.deleteEventByDate(parsedDate);
            return isDeleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ capacity decrement/increment
    @PutMapping("/{id:\\d+}/capacity/decrement")
    public ResponseEntity<Event> decrement(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.decrementCapacity(id));
    }

    @PutMapping("/{id:\\d+}/capacity/increment")
    public ResponseEntity<Event> increment(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.incrementCapacity(id));
    }

    // ✅ Sponsoriser un event par un club
    @PutMapping("/{id:\\d+}/sponsor")
    public ResponseEntity<?> sponsorEvent(
            @PathVariable Long id,
            @RequestParam Long clubId) {
        try {
            Event updated = eventService.sponsorEvent(id, clubId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/stats/total")
    public Long totalEvents() {
        return eventService.totalEvents();
    }

    @GetMapping("/stats/status")
    public List<Object[]> statsStatus() {
        return eventService.statsByStatus();
    }

    @GetMapping("/stats/type")
    public List<Object[]> statsType() {
        return eventService.statsByType();
    }

    @GetMapping("/stats/mode")
    public List<Object[]> statsMode() {
        return eventService.statsByMode();
    }

    // ✅ Auto handler errors
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntime(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}