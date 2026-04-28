package tn.esprit.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.user.entity.UserSubscription;
import tn.esprit.user.entity.UserSubscription.SubscriptionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    
    // Find user's active subscription
    Optional<UserSubscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
    
    // Find all user subscriptions (history)
    List<UserSubscription> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find active subscriptions
    List<UserSubscription> findByStatus(SubscriptionStatus status);
    
    // Find expiring subscriptions (within next 7 days)
    @Query("SELECT s FROM UserSubscription s WHERE s.status = 'ACTIVE' AND s.endDate BETWEEN :now AND :sevenDaysLater")
    List<UserSubscription> findExpiringSoon(LocalDateTime now, LocalDateTime sevenDaysLater);
    
    // Find expired subscriptions that need status update
    @Query("SELECT s FROM UserSubscription s WHERE s.status = 'ACTIVE' AND s.endDate < :now")
    List<UserSubscription> findExpiredSubscriptions(LocalDateTime now);
    
    // Check if user has active subscription
    boolean existsByUserIdAndStatus(Long userId, SubscriptionStatus status);
    
    // Count active subscriptions
    long countByStatus(SubscriptionStatus status);
    
    // Find subscriptions by abonnement
    List<UserSubscription> findByAbonnementId(Long abonnementId);
}
