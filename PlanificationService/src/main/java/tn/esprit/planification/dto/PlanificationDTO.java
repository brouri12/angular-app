package tn.esprit.planification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.planification.enums.PlanificationType;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanificationDTO {
    
    private Long idPlanification;
    
    @NotBlank(message = "Title is required")
    private String titre;
    
    @NotNull(message = "Type is required")
    private PlanificationType type;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    private LocalTime heureDebut;
    
    @NotNull(message = "End time is required")
    private LocalTime heureFin;
    
    @NotNull(message = "Room ID is required")
    private Long salleId;
    
    private String salleNom;
    
    @NotNull(message = "Group ID is required")
    private Long groupId;
    
    private String groupLevel;
}
