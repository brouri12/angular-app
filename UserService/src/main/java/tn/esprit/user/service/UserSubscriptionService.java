package tn.esprit.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.user.dto.SubscriptionActionRequest;
import tn.esprit.user.dto.UserSubscriptionDTO;
import tn.esprit.user.entity.UserSubscription;
import tn.esprit.user.entity.UserSubscription.SubscriptionStatus;
import tn.esprit.user.repository.UserSubscriptionRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSubscriptionService {
    
    private final UserSubscriptionRepository subscriptionRepository;
    
    /**
     * Get user's current active subscription
     */
    public UserSubscriptionDTO getCurrentSubscription(Long userId) {
        return subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    /**
     * Get user's subscription history
     */
    public List<UserSubscriptionDTO> getSubscriptionHistory(Long userId) {
        return subscriptionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Create new subscription for user
     */
    @Transactional
    public UserSubscriptionDTO createSubscription(Long userId, Long abonnementId, String abonnementName, 
                                                   Double price, String billingCycle, Long paymentId) {
        // Cancel any existing active subscription
        subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .ifPresent(existing -> {
                    existing.setStatus(SubscriptionStatus.CANCELLED);
                    existing.setCancelledAt(LocalDateTime.now());
                    existing.setCancellationReason("Upgraded to new plan");
                    subscriptionRepository.save(existing);
                });
        
        // Calculate duration based on billing cycle
        int durationDays = "ANNUAL".equals(billingCycle) ? 365 : 30;
        
        UserSubscription subscription = new UserSubscription();
        subscription.setUserId(userId);
        subscription.setAbonnementId(abonnementId);
        subscription.setAbonnementName(abonnementName);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusDays(durationDays));
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setAutoRenew(false);
        subscription.setPaymentId(paymentId);
        subscription.setPrice(price);
        subscription.setBillingCycle(billingCycle);
        
        UserSubscription saved = subscriptionRepository.save(subscription);
        log.info("Created subscription for user {} with plan {}", userId, abonnementName);
        
        return convertToDTO(saved);
    }
    
    /**
     * Cancel subscription
     */
    @Transactional
    public UserSubscriptionDTO cancelSubscription(Long userId, SubscriptionActionRequest request) {
        UserSubscription subscription = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active subscription found"));
        
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setCancelledAt(LocalDateTime.now());
        subscription.setCancellationReason(request.getReason());
        subscription.setAutoRenew(false);
        
        UserSubscription saved = subscriptionRepository.save(subscription);
        log.info("Cancelled subscription for user {}: {}", userId, request.getReason());
        
        return convertToDTO(saved);
    }
    
    /**
     * Renew subscription
     */
    @Transactional
    public UserSubscriptionDTO renewSubscription(Long userId, Long paymentId) {
        UserSubscription current = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active subscription found"));
        
        // Extend end date
        int durationDays = "ANNUAL".equals(current.getBillingCycle()) ? 365 : 30;
        current.setEndDate(current.getEndDate().plusDays(durationDays));
        current.setPaymentId(paymentId);
        
        UserSubscription saved = subscriptionRepository.save(current);
        log.info("Renewed subscription for user {}", userId);
        
        return convertToDTO(saved);
    }
    
    /**
     * Toggle auto-renew
     */
    @Transactional
    public UserSubscriptionDTO toggleAutoRenew(Long userId, Boolean autoRenew) {
        UserSubscription subscription = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active subscription found"));
        
        subscription.setAutoRenew(autoRenew);
        UserSubscription saved = subscriptionRepository.save(subscription);
        
        log.info("Set auto-renew to {} for user {}", autoRenew, userId);
        return convertToDTO(saved);
    }
    
    /**
     * Upgrade/Downgrade subscription
     */
    @Transactional
    public UserSubscriptionDTO changeSubscription(Long userId, Long newAbonnementId, 
                                                   String newAbonnementName, Double newPrice, Long paymentId) {
        UserSubscription current = subscriptionRepository.findByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("No active subscription found"));
        
        // Cancel current
        current.setStatus(SubscriptionStatus.CANCELLED);
        current.setCancelledAt(LocalDateTime.now());
        current.setCancellationReason("Changed to " + newAbonnementName);
        subscriptionRepository.save(current);
        
        // Create new subscription
        return createSubscription(userId, newAbonnementId, newAbonnementName, 
                                newPrice, current.getBillingCycle(), paymentId);
    }
    
    /**
     * Check if user has active subscription
     */
    public boolean hasActiveSubscription(Long userId) {
        return subscriptionRepository.existsByUserIdAndStatus(userId, SubscriptionStatus.ACTIVE);
    }
    
    /**
     * Get all active subscriptions (admin)
     */
    public List<UserSubscriptionDTO> getAllActiveSubscriptions() {
        return subscriptionRepository.findByStatus(SubscriptionStatus.ACTIVE)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Scheduled task to update expired subscriptions
     * Runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void updateExpiredSubscriptions() {
        List<UserSubscription> expired = subscriptionRepository.findExpiredSubscriptions(LocalDateTime.now());
        
        for (UserSubscription subscription : expired) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
            log.info("Marked subscription {} as expired for user {}", 
                    subscription.getId(), subscription.getUserId());
        }
        
        log.info("Updated {} expired subscriptions", expired.size());
    }
    
    /**
     * Get expiring subscriptions (for notifications)
     * Runs daily at 9 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void notifyExpiringSoon() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        
        List<UserSubscription> expiring = subscriptionRepository.findExpiringSoon(now, sevenDaysLater);
        
        for (UserSubscription subscription : expiring) {
            long daysLeft = subscription.getDaysRemaining();
            log.info("Subscription {} for user {} expires in {} days", 
                    subscription.getId(), subscription.getUserId(), daysLeft);
            // TODO: Send email notification
        }
        
        log.info("Found {} subscriptions expiring soon", expiring.size());
    }
    
    /**
     * Convert entity to DTO
     */
    private UserSubscriptionDTO convertToDTO(UserSubscription subscription) {
        UserSubscriptionDTO dto = new UserSubscriptionDTO();
        dto.setId(subscription.getId());
        dto.setUserId(subscription.getUserId());
        dto.setAbonnementId(subscription.getAbonnementId());
        dto.setAbonnementName(subscription.getAbonnementName());
        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());
        dto.setStatus(subscription.getStatus());
        dto.setAutoRenew(subscription.getAutoRenew());
        dto.setPaymentId(subscription.getPaymentId());
        dto.setPrice(subscription.getPrice());
        dto.setBillingCycle(subscription.getBillingCycle());
        dto.setCreatedAt(subscription.getCreatedAt());
        dto.setCancelledAt(subscription.getCancelledAt());
        dto.setCancellationReason(subscription.getCancellationReason());
        
        // Computed fields
        dto.setDaysRemaining(subscription.getDaysRemaining());
        dto.setIsActive(subscription.isActive());
        dto.setIsExpired(subscription.isExpired());
        dto.setIsExpiringSoon(subscription.isExpiringSoon());
        
        // Calculate progress percentage
        if (subscription.getStartDate() != null && subscription.getEndDate() != null) {
            long totalDays = Duration.between(subscription.getStartDate(), subscription.getEndDate()).toDays();
            long elapsedDays = Duration.between(subscription.getStartDate(), LocalDateTime.now()).toDays();
            dto.setProgressPercentage((double) elapsedDays / totalDays * 100);
        }
        
        return dto;
    }
}
