package tn.esprit.abonnement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;
import tn.esprit.abonnement.dto.PaymentDTO;
import tn.esprit.abonnement.entity.Abonnement;
import tn.esprit.abonnement.repository.AbonnementRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Slf4j
public class RenewalReminderService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AbonnementRepository abonnementRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PromoCodeService promoCodeService;

    private static final String USER_SERVICE_URL = "http://localhost:8085/api/payments";
    private final Map<Long, String> sentReminders = new HashMap<>(); // Track sent emails

    /**
     * Check for expiring subscriptions every day at 9 AM
     * Sends email 7 days before expiration with promo code
     */
   // @Scheduled(cron = "0 0 9 * * *") // Every day at 9 AM (production)
     @Scheduled(fixedRate = 120000) // Every 2 minutes (testing)
    public void checkExpiringSubscriptions() {
        log.info("========================================");
        log.info("🔍 Checking for expiring subscriptions...");
        log.info("========================================");

        try {
            // Get all validated payments from UserService
            String url = USER_SERVICE_URL + "/validated";
            log.info("📞 Calling UserService: {}", url);
            
            PaymentDTO[] payments = restTemplate.getForObject(url, PaymentDTO[].class);

            if (payments == null || payments.length == 0) {
                log.info("ℹ️ No validated payments found");
                return;
            }
            
            log.info("📦 Received {} payments from UserService", payments.length);

            LocalDate today = LocalDate.now();
            LocalDate in7Days = today.plusDays(7);
            int remindersCount = 0;

            for (PaymentDTO payment : payments) {
                if (!"Validé".equals(payment.getStatut())) {
                    continue; // Skip non-validated payments
                }

                // Calculate expiration date
                LocalDate expirationDate = calculateExpirationDate(payment);
                if (expirationDate == null) {
                    continue;
                }

                // Check if expires in exactly 7 days
                long daysUntilExpiration = ChronoUnit.DAYS.between(today, expirationDate);
                
                if (daysUntilExpiration <= 7) { // Changed to 4 for testing
                    // Check if we already sent reminder for this payment
                    String reminderKey = payment.getId_payment() + "_" + expirationDate.toString();
                    if (sentReminders.containsKey(payment.getId_payment())) {
                        log.info("⏭️ Reminder already sent for payment ID: {}", payment.getId_payment());
                        continue;
                    }

                    // Send renewal reminder with promo code
                    sendRenewalReminder(payment, expirationDate);
                    sentReminders.put(payment.getId_payment(), reminderKey);
                    remindersCount++;
                }
            }

            log.info("========================================");
            log.info("✅ Renewal reminders sent: {}", remindersCount);
            log.info("========================================");

        } catch (Exception e) {
            log.error("❌ Error checking expiring subscriptions", e);
        }
    }

    /**
     * Calculate expiration date based on payment method
     */
    private LocalDate calculateExpirationDate(PaymentDTO payment) {
        try {
            LocalDate startDate;
            
            // For card/PayPal: use date_paiement
            if ("carte".equalsIgnoreCase(payment.getMethodePaiement()) || 
                "paypal".equalsIgnoreCase(payment.getMethodePaiement())) {
                if (payment.getDatePaiement() == null) {
                    return null;
                }
                startDate = payment.getDatePaiement().toLocalDate();
            }
            // For bank transfer: use date_validation
            else if ("virement".equalsIgnoreCase(payment.getMethodePaiement())) {
                if (payment.getDateValidation() == null) {
                    return null;
                }
                startDate = payment.getDateValidation().toLocalDate();
            } else {
                return null;
            }

            // Get subscription duration
            Optional<Abonnement> abonnementOpt = abonnementRepository.findById(payment.getIdAbonnement());
            if (abonnementOpt.isEmpty()) {
                return null;
            }

            int durationDays = abonnementOpt.get().getDuree_jours();
            return startDate.plusDays(durationDays);

        } catch (Exception e) {
            log.error("Error calculating expiration date for payment {}", payment.getId_payment(), e);
            return null;
        }
    }

    /**
     * Send renewal reminder email with promo code
     */
    private void sendRenewalReminder(PaymentDTO payment, LocalDate expirationDate) {
        try {
            // Get subscription details
            Optional<Abonnement> abonnementOpt = abonnementRepository.findById(payment.getIdAbonnement());
            if (abonnementOpt.isEmpty()) {
                log.warn("⚠️ Abonnement not found for ID: {}", payment.getIdAbonnement());
                return;
            }

            Abonnement abonnement = abonnementOpt.get();

            // Generate unique promo code
            String promoCode = promoCodeService.generateRenewalPromoCode();
            double discount = 15.0; // 15% discount for renewal

            // Format expiration date
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String formattedDate = expirationDate.format(formatter);

            // Send email
            emailService.sendRenewalReminderWithPromo(
                payment.getEmailClient(),
                payment.getNomClient(),
                abonnement.getNom(),
                formattedDate,
                promoCode,
                discount
            );

            log.info("✅ Renewal reminder sent to: {} | Subscription: {} | Promo: {} | Expires: {}", 
                     payment.getEmailClient(), 
                     abonnement.getNom(), 
                     promoCode,
                     formattedDate);

        } catch (Exception e) {
            log.error("❌ Error sending renewal reminder for payment {}", payment.getId_payment(), e);
        }
    }

    /**
     * Manual trigger for testing (can be called via REST endpoint)
     */
    public void triggerManualCheck() {
        log.info("🔧 Manual trigger: Checking expiring subscriptions...");
        checkExpiringSubscriptions();
    }

    /**
     * Clear sent reminders cache (for testing)
     */
    public void clearReminderCache() {
        sentReminders.clear();
        log.info("🗑️ Reminder cache cleared");
    }
}
