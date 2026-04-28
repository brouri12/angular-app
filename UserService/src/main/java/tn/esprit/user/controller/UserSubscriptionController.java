package tn.esprit.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.esprit.user.dto.SubscriptionActionRequest;
import tn.esprit.user.dto.UserSubscriptionDTO;
import tn.esprit.user.service.UserSubscriptionService;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class UserSubscriptionController {
    
    private final UserSubscriptionService subscriptionService;
    
    /**
     * Get current user's active subscription
     */
    @GetMapping("/current")
    public ResponseEntity<UserSubscriptionDTO> getCurrentSubscription(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        UserSubscriptionDTO subscription = subscriptionService.getCurrentSubscription(userId);
        
        if (subscription == null) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(subscription);
    }
    
    /**
     * Get current user's subscription history
     */
    @GetMapping("/history")
    public ResponseEntity<List<UserSubscriptionDTO>> getSubscriptionHistory(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<UserSubscriptionDTO> history = subscriptionService.getSubscriptionHistory(userId);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Check if user has active subscription
     */
    @GetMapping("/has-active")
    public ResponseEntity<Boolean> hasActiveSubscription(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        boolean hasActive = subscriptionService.hasActiveSubscription(userId);
        return ResponseEntity.ok(hasActive);
    }
    
    /**
     * Cancel current subscription
     */
    @PostMapping("/cancel")
    public ResponseEntity<UserSubscriptionDTO> cancelSubscription(
            Authentication authentication,
            @RequestBody SubscriptionActionRequest request) {
        Long userId = getUserIdFromAuth(authentication);
        log.info("User {} cancelling subscription", userId);
        
        UserSubscriptionDTO cancelled = subscriptionService.cancelSubscription(userId, request);
        return ResponseEntity.ok(cancelled);
    }
    
    /**
     * Toggle auto-renew
     */
    @PatchMapping("/auto-renew")
    public ResponseEntity<UserSubscriptionDTO> toggleAutoRenew(
            Authentication authentication,
            @RequestBody SubscriptionActionRequest request) {
        Long userId = getUserIdFromAuth(authentication);
        log.info("User {} toggling auto-renew to {}", userId, request.getAutoRenew());
        
        UserSubscriptionDTO updated = subscriptionService.toggleAutoRenew(userId, request.getAutoRenew());
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Get all active subscriptions (admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<List<UserSubscriptionDTO>> getAllActiveSubscriptions() {
        List<UserSubscriptionDTO> subscriptions = subscriptionService.getAllActiveSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }
    
    /**
     * Get subscription by user ID (admin only)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<UserSubscriptionDTO> getSubscriptionByUserId(@PathVariable Long userId) {
        UserSubscriptionDTO subscription = subscriptionService.getCurrentSubscription(userId);
        
        if (subscription == null) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(subscription);
    }
    
    /**
     * Extract user ID from JWT token
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String userIdStr = jwt.getClaim("user_id");
            if (userIdStr != null) {
                return Long.parseLong(userIdStr);
            }
        }
        throw new RuntimeException("Unable to extract user ID from authentication");
    }
}
