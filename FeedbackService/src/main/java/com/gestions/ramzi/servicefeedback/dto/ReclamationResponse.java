package com.gestions.ramzi.servicefeedback.dto;

import com.gestions.ramzi.servicefeedback.entities.CategorieReclamation;
import com.gestions.ramzi.servicefeedback.entities.Priorite;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReclamationResponse {
    private Long id;
    private Long userId;
    private String objet;
    private String description;
    private String status;
    private LocalDateTime date;
    private Priorite priorite;
    private CategorieReclamation categorie;
    
    // Informations utilisateur enrichies
    private UserDTO user;
}
