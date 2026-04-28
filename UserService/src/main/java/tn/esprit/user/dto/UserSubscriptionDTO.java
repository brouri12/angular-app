package tn.esprit.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.user.entity.UserSubscription.SubscriptionStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionDTO {
    private Long id;
    private Long userId;
    private Long abonnementId;
    private String abonnementName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private SubscriptionStatus status;
    private Boolean autoRenew;
    private Long paymentId;
    private Double price;
    private String billingCycle;
    private LocalDateTime createdAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    
    // Computed fields
    private Long daysRemaining;
    private Boolean isActive;
    private Boolean isExpired;
    private Boolean isExpiringSoon;
    private Double progressPercentage;
}
