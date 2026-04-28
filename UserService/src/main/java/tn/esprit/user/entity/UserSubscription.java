package tn.esprit.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "abonnement_id", nullable = false)
    private Long abonnementId;
    
    @Column(name = "abonnement_name", nullable = false)
    private String abonnementName;
    
    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;
    
    @Column(name = "auto_renew")
    private Boolean autoRenew = false;
    
    @Column(name = "payment_id")
    private Long paymentId;
    
    @Column(name = "price")
    private Double price;
    
    @Column(name = "billing_cycle")
    private String billingCycle; // MONTHLY, ANNUAL
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    public enum SubscriptionStatus {
        ACTIVE,      // Currently active
        EXPIRED,     // Past end date
        CANCELLED,   // User cancelled
        PENDING,     // Payment pending
        SUSPENDED    // Admin suspended
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Helper methods
    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE && 
               LocalDateTime.now().isBefore(endDate);
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(endDate);
    }
    
    public long getDaysRemaining() {
        if (isExpired()) return 0;
        return java.time.Duration.between(LocalDateTime.now(), endDate).toDays();
    }
    
    public boolean isExpiringSoon() {
        return getDaysRemaining() <= 7 && getDaysRemaining() > 0;
    }
}
