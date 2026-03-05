package tn.esprit.abonnement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tn.esprit.abonnement.dto.PaymentDTO;
import tn.esprit.abonnement.dto.SubscriptionReminderDTO;
import tn.esprit.abonnement.entity.Abonnement;
import tn.esprit.abonnement.repository.AbonnementRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubscriptionReminderService {
    
    private static final Logger log = LoggerFactory.getLogger(SubscriptionReminderService.class);
    
    @Autowired
    private AbonnementRepository abonnementRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String USER_SERVICE_URL = "http://localhost:8085/api/payments";
    
    // Store active reminders in memory (no new table needed)
    private final Map<Long, List<SubscriptionReminderDTO>> activeReminders = new HashMap<>();
    
    /**
     * Check for expiring subscriptions every 2 minutes
     */
    @Scheduled(cron = "0 */2 * * * *")
    @Transactional(readOnly = true)
    public void checkExpiringSubscriptions() {
        log.info("🔔 Starting subscription expiration check...");
        
        List<SubscriptionReminderDTO> reminders = new ArrayList<>();
        
        try {
            // Get all validated payments from UserService
            List<PaymentDTO> validatedPayments = getValidatedPaymentsFromUserService();
            log.info("📋 Found {} validated payments from UserService", validatedPayments.size());
            
            for (PaymentDTO payment : validatedPayments) {
                log.info("🔍 Processing payment {} for user {} (method: {})", 
                    payment.getId_payment(), payment.getIdUser(), payment.getMethodePaiement());
                try {
                    // Get subscription duration
                    Optional<Abonnement> abonnementOpt = abonnementRepository.findById(payment.getIdAbonnement());
                    
                    if (abonnementOpt.isEmpty()) {
                        log.warn("⚠️ Abonnement {} not found for payment {}", payment.getIdAbonnement(), payment.getId_payment());
                        continue;
                    }
                    
                    Abonnement abonnement = abonnementOpt.get();
                    Integer durationDays = abonnement.getDuree_jours();
                    
                    if (durationDays == null) {
                        log.warn("⚠️ Duration is null for abonnement {}", payment.getIdAbonnement());
                        continue;
                    }
                    
                    log.info("📅 Abonnement {} has duration: {} days", payment.getIdAbonnement(), durationDays);
                    
                    // Calculate expiration date based on payment method
                    LocalDateTime startDate = getStartDate(payment);
                    if (startDate == null) {
                        log.warn("⚠️ Start date is null for payment {} (method: {})", 
                            payment.getId_payment(), payment.getMethodePaiement());
                        continue;
                    }
                    
                    log.info("📅 Start date for payment {}: {}", payment.getId_payment(), startDate);
                    
                    LocalDateTime expirationDate = startDate.plusDays(durationDays);
                    LocalDateTime now = LocalDateTime.now();
                    
                    // Calculate days until expiration
                    long daysUntilExpiration = ChronoUnit.DAYS.between(now, expirationDate);
                    
                    log.info("⏰ Payment {} expires on {} ({} days from now)", 
                        payment.getId_payment(), expirationDate, daysUntilExpiration);
                    
                    // Create reminders based on days until expiration
                    SubscriptionReminderDTO reminder = createReminder(payment, expirationDate, (int) daysUntilExpiration);
                    
                    if (reminder != null) {
                        log.info("✅ Created {} reminder for user {}", reminder.getReminderType(), payment.getIdUser());
                        reminders.add(reminder);
                    } else {
                        log.info("ℹ️ No reminder needed for payment {} ({} days until expiration)", 
                            payment.getId_payment(), daysUntilExpiration);
                    }
                    
                } catch (Exception e) {
                    log.error("Error processing payment {}: {}", payment.getId_payment(), e.getMessage());
                }
            }
            
            // Update active reminders
            updateActiveReminders(reminders);
            
            log.info("✅ Subscription check complete. Found {} reminders", reminders.size());
            
        } catch (Exception e) {
            log.error("❌ Error fetching payments from UserService: {}", e.getMessage());
        }
    }
    
    /**
     * Get validated payments from UserService via REST API
     */
    private List<PaymentDTO> getValidatedPaymentsFromUserService() {
        try {
            String url = USER_SERVICE_URL + "/validated";
            ResponseEntity<List<PaymentDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<PaymentDTO>>() {}
            );
            return response.getBody() != null ? response.getBody() : new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to fetch payments from UserService: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * This method is now disabled - using 2-minute schedule instead
     */
    // @Scheduled(cron = "0 0 * * * *")
    // public void checkImmediateReminders() {
    //     log.info("⏰ Checking for immediate subscription reminders...");
    //     checkExpiringSubscriptions();
    // }
    
    /**
     * Get start date based on payment method
     */
    private LocalDateTime getStartDate(PaymentDTO payment) {
        String method = payment.getMethodePaiement();
        
        if ("virement".equalsIgnoreCase(method)) {
            // For bank transfer, use validation date
            return payment.getDateValidation();
        } else {
            // For card/PayPal, use payment date
            return payment.getDatePaiement();
        }
    }
    
    /**
     * Create reminder based on days until expiration
     */
    private SubscriptionReminderDTO createReminder(PaymentDTO payment, LocalDateTime expirationDate, int daysUntilExpiration) {
        // Only create reminders for specific thresholds
        if (daysUntilExpiration < 0) {
            // Expired
            return new SubscriptionReminderDTO(
                payment.getIdUser(),
                payment.getNomClient(),
                payment.getEmailClient(),
                payment.getTypeAbonnement(),
                expirationDate,
                daysUntilExpiration,
                "EXPIRED",
                "Your subscription has expired. Renew now to continue accessing premium features!"
            );
        } else if (daysUntilExpiration == 0) {
            // Expiring today
            return new SubscriptionReminderDTO(
                payment.getIdUser(),
                payment.getNomClient(),
                payment.getEmailClient(),
                payment.getTypeAbonnement(),
                expirationDate,
                daysUntilExpiration,
                "EXPIRING_TODAY",
                "Your subscription expires today! Renew now to avoid interruption."
            );
        } else if (daysUntilExpiration <= 7) {
            // Expiring within 7 days
            return new SubscriptionReminderDTO(
                payment.getIdUser(),
                payment.getNomClient(),
                payment.getEmailClient(),
                payment.getTypeAbonnement(),
                expirationDate,
                daysUntilExpiration,
                "EXPIRING_SOON",
                String.format("Your subscription expires in %d days. Renew now to continue learning!", daysUntilExpiration)
            );
        } else if (daysUntilExpiration <= 14) {
            // Expiring within 14 days
            return new SubscriptionReminderDTO(
                payment.getIdUser(),
                payment.getNomClient(),
                payment.getEmailClient(),
                payment.getTypeAbonnement(),
                expirationDate,
                daysUntilExpiration,
                "EXPIRING_SOON",
                String.format("Your subscription expires in %d days. Consider renewing soon!", daysUntilExpiration)
            );
        }
        
        return null; // No reminder needed
    }
    
    /**
     * Update active reminders in memory
     */
    private void updateActiveReminders(List<SubscriptionReminderDTO> reminders) {
        activeReminders.clear();
        
        // Group reminders by user ID
        Map<Long, List<SubscriptionReminderDTO>> grouped = reminders.stream()
            .collect(Collectors.groupingBy(SubscriptionReminderDTO::getUserId));
        
        activeReminders.putAll(grouped);
    }
    
    /**
     * Get reminders for a specific user
     */
    public List<SubscriptionReminderDTO> getUserReminders(Long userId) {
        List<SubscriptionReminderDTO> reminders = activeReminders.getOrDefault(userId, new ArrayList<>());
        
        if (reminders.isEmpty()) {
            log.info("✓ No reminders found for user: {}", userId);
        } else {
            log.info("✓ Found {} subscription reminder(s) for user {}", reminders.size(), userId);
        }
        
        return reminders;
    }
    
    /**
     * Get all active reminders
     */
    public List<SubscriptionReminderDTO> getAllReminders() {
        return activeReminders.values().stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }
    
    /**
     * Get reminder count for a user
     */
    public int getUserReminderCount(Long userId) {
        return activeReminders.getOrDefault(userId, new ArrayList<>()).size();
    }
    
    /**
     * Dismiss a reminder for a user (remove from memory)
     */
    public void dismissReminder(Long userId, String reminderType) {
        List<SubscriptionReminderDTO> userReminders = activeReminders.get(userId);
        if (userReminders != null) {
            userReminders.removeIf(r -> r.getReminderType().equals(reminderType));
            if (userReminders.isEmpty()) {
                activeReminders.remove(userId);
            }
        }
    }
    
    /**
     * Manual trigger for testing
     */
    public List<SubscriptionReminderDTO> checkNow() {
        log.info("🔔 Manual subscription check triggered");
        checkExpiringSubscriptions();
        return getAllReminders();
    }
}
