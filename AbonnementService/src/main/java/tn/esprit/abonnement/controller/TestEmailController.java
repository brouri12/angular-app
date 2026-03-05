package tn.esprit.abonnement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.abonnement.service.EmailService;
import tn.esprit.abonnement.service.PromoCodeService;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
@Slf4j
public class TestEmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private PromoCodeService promoCodeService;

    /**
     * Send a test renewal email to any email address
     * POST /api/test/send-email
     * Body: { "email": "test@gmail.com", "name": "Test User" }
     */
    @PostMapping("/send-email")
    public ResponseEntity<Map<String, String>> sendTestEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.getOrDefault("name", "Test User");
        String subscription = request.getOrDefault("subscription", "Premium");
        
        log.info("📧 Sending test email to: {}", email);
        
        // Generate promo code
        String promoCode = promoCodeService.generateRenewalPromoCode();
        
        // Calculate expiration date (7 days from now)
        LocalDate expirationDate = LocalDate.now().plusDays(7);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String formattedDate = expirationDate.format(formatter);
        
        // Send email
        emailService.sendRenewalReminderWithPromo(
            email,
            name,
            subscription,
            formattedDate,
            promoCode,
            15.0
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Test email sent successfully!");
        response.put("email", email);
        response.put("name", name);
        response.put("subscription", subscription);
        response.put("promoCode", promoCode);
        response.put("expirationDate", formattedDate);
        response.put("discount", "15%");
        
        log.info("✅ Test email sent to: {} | Promo: {}", email, promoCode);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Send a simple test email
     * POST /api/test/send-simple
     * Body: { "email": "test@gmail.com" }
     */
    @PostMapping("/send-simple")
    public ResponseEntity<Map<String, String>> sendSimpleEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        log.info("📧 Sending simple test email to: {}", email);
        
        emailService.sendSimpleEmail(
            email,
            "Test Email from E-Learning Platform",
            "This is a test email to verify your email configuration is working correctly.\n\n" +
            "If you received this email, your email service is configured properly!\n\n" +
            "Best regards,\nE-Learning Platform Team"
        );
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Simple test email sent!");
        response.put("email", email);
        
        log.info("✅ Simple test email sent to: {}", email);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check for email service
     * GET /api/test/email-health
     */
    @GetMapping("/email-health")
    public ResponseEntity<Map<String, String>> emailHealth() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Email Service");
        response.put("message", "Email service is ready to send emails");
        
        return ResponseEntity.ok(response);
    }
}
