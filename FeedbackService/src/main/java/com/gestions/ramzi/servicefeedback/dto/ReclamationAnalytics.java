package com.gestions.ramzi.servicefeedback.dto;

import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReclamationAnalytics {
    private long totalReclamations;
    private Map<String, Long> parStatus;
    private double tempsResolutionMoyen; // en heures
    private Map<String, Long> parMois;
    private List<Reclamation> nonResolues;
    private long reclamationEnAttente;
    private long reclamationResolue;
}
