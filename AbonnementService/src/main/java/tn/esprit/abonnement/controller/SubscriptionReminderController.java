package tn.esprit.abonnement.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.abonnement.dto.SubscriptionReminderDTO;
import tn.esprit.abonnement.service.SubscriptionReminderService;

import java.util.List;

@RestController
@RequestMapping("/api/subscription-reminders")
public class SubscriptionReminderController {
    
    private static final Logger log = LoggerFactory.getLogger(SubscriptionReminderController.class);
    
    @Autowired
    private SubscriptionReminderService reminderService;
    
    /**
     * Get reminders for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubscriptionReminderDTO>> getUserReminders(@PathVariable Long userId) {
        log.info("📬 Fetching reminders for user: {}", userId);
        List<SubscriptionReminderDTO> reminders = reminderService.getUserReminders(userId);
        return ResponseEntity.ok(reminders);
    }
    
    /**
     * Get reminder count for a user
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Integer> getUserReminderCount(@PathVariable Long userId) {
        int count = reminderService.getUserReminderCount(userId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get all active reminders (admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<List<SubscriptionReminderDTO>> getAllReminders() {
        log.info("Fetching all reminders");
        List<SubscriptionReminderDTO> reminders = reminderService.getAllReminders();
        return ResponseEntity.ok(reminders);
    }
    
    /**
     * Dismiss a reminder
     */
    @DeleteMapping("/user/{userId}/dismiss/{reminderType}")
    public ResponseEntity<Void> dismissReminder(
            @PathVariable Long userId,
            @PathVariable String reminderType) {
        log.info("Dismissing reminder {} for user {}", reminderType, userId);
        reminderService.dismissReminder(userId, reminderType);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Manual trigger for checking subscriptions (testing/admin)
     */
    @PostMapping("/check-now")
    public ResponseEntity<List<SubscriptionReminderDTO>> checkNow() {
        log.info("Manual subscription check triggered");
        List<SubscriptionReminderDTO> reminders = reminderService.checkNow();
        return ResponseEntity.ok(reminders);
    }
}
