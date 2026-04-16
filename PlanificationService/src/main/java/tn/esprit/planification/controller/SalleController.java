package tn.esprit.planification.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.planification.dto.SalleDTO;
import tn.esprit.planification.service.SalleService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/salles")
@RequiredArgsConstructor
public class SalleController {
    
    private final SalleService salleService;
    
    @GetMapping
    public ResponseEntity<List<SalleDTO>> getAllSalles() {
        return ResponseEntity.ok(salleService.getAllSalles());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SalleDTO> getSalleById(@PathVariable Long id) {
        return ResponseEntity.ok(salleService.getSalleById(id));
    }
    
    @PostMapping
    public ResponseEntity<SalleDTO> createSalle(@Valid @RequestBody SalleDTO salleDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salleService.createSalle(salleDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SalleDTO> updateSalle(@PathVariable Long id, @Valid @RequestBody SalleDTO salleDTO) {
        return ResponseEntity.ok(salleService.updateSalle(id, salleDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalle(@PathVariable Long id) {
        salleService.deleteSalle(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/capacity/{minCapacity}")
    public ResponseEntity<List<SalleDTO>> getSallesByCapacity(@PathVariable Integer minCapacity) {
        return ResponseEntity.ok(salleService.getSallesByCapacity(minCapacity));
    }
    
    @GetMapping("/{id}/availability")
    public ResponseEntity<Boolean> checkSalleAvailability(
            @PathVariable Long id,
            @RequestParam String date,
            @RequestParam String heureDebut,
            @RequestParam String heureFin) {
        LocalDate localDate = LocalDate.parse(date);
        LocalTime startTime = LocalTime.parse(heureDebut);
        LocalTime endTime = LocalTime.parse(heureFin);
        return ResponseEntity.ok(salleService.isSalleAvailable(id, localDate, startTime, endTime));
    }
}
