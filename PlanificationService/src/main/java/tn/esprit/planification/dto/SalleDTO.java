package tn.esprit.planification.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalleDTO {
    
    private Long idSalle;
    
    @NotBlank(message = "Room name is required")
    private String nomSalle;
    
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacite;
    
    @NotBlank(message = "Location is required")
    private String localisation;
}
