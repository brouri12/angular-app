package tn.esprit.reservationservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.reservationservice.entity.Registration;
import tn.esprit.reservationservice.service.RegistrationService;

import java.util.List;

@CrossOrigin(origins = {
        "http://localhost:4200",
        "http://localhost:4201"
})
@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // GET /registrations
    @GetMapping
    public ResponseEntity<List<Registration>> getAllRegistrations() {
        return ResponseEntity.ok(registrationService.getAllRegistrations());
    }

    // GET /registrations/event/{eventId}
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Registration>> getRegistrationsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByEventId(eventId));
    }

    // GET /registrations/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Registration> getRegistrationById(@PathVariable Long id) {
        return registrationService.getRegistrationById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET /registrations/by-user/{userId}
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<Registration>> getRegistrationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByUserId(userId));
    }

    // POST /registrations
    @PostMapping
    public ResponseEntity<Registration> createRegistration(
            @Valid @RequestBody Registration registration,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Registration created = registrationService.createRegistration(registration, authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /registrations/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Registration> updateRegistration(
            @PathVariable Long id,
            @Valid @RequestBody Registration registrationDetails
    ) {
        Registration updated = registrationService.updateRegistration(id, registrationDetails);
        return ResponseEntity.ok(updated);
    }

    // DELETE /registrations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistration(@PathVariable Long id) {
        registrationService.deleteRegistration(id);
        return ResponseEntity.noContent().build();
    }

    // DELETE /registrations/by-event/{eventId}
    @DeleteMapping("/by-event/{eventId}")
    public ResponseEntity<String> deleteByEvent(@PathVariable Long eventId) {
        int deleted = registrationService.deleteByEventId(eventId);
        return ResponseEntity.ok("Deleted registrations = " + deleted);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}