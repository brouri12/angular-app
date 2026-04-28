package tn.esprit.planification.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.planification.dto.PlanificationDTO;
import tn.esprit.planification.service.PlanificationService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/planifications")
@RequiredArgsConstructor
public class PlanificationController {
    
    private final PlanificationService planificationService;
    
    @GetMapping
    public ResponseEntity<List<PlanificationDTO>> getAllPlanifications() {
        return ResponseEntity.ok(planificationService.getAllPlanifications());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PlanificationDTO> getPlanificationById(@PathVariable Long id) {
        return ResponseEntity.ok(planificationService.getPlanificationById(id));
    }
    
    @PostMapping
    public ResponseEntity<PlanificationDTO> createPlanification(@Valid @RequestBody PlanificationDTO planificationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planificationService.createPlanification(planificationDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PlanificationDTO> updatePlanification(@PathVariable Long id, @Valid @RequestBody PlanificationDTO planificationDTO) {
        return ResponseEntity.ok(planificationService.updatePlanification(id, planificationDTO));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlanification(@PathVariable Long id) {
        planificationService.deletePlanification(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/date/{date}")
    public ResponseEntity<List<PlanificationDTO>> getPlanificationsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(planificationService.getPlanificationsByDate(date));
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<PlanificationDTO>> getPlanificationsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(planificationService.getPlanificationsByDateRange(startDate, endDate));
    }
}
