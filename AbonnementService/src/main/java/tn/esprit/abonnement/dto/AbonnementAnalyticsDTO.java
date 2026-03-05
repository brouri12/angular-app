package tn.esprit.abonnement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AbonnementAnalyticsDTO {
    
    // Overall statistics
    private Long totalAbonnements;
    private Long activeAbonnements;
    private Long inactiveAbonnements;
    private Double averagePrice;
    private Double totalRevenuePotential;
    
    // Feature statistics
    private Long withPrioritySupport;
    private Long withUnlimitedAccess;
    
    // Breakdown by status
    private Map<String, Long> countByStatus;
    
    // Breakdown by access level
    private Map<String, Long> countByAccessLevel;
    
    // Most popular subscriptions
    private Map<String, Long> popularityByName;
}
