package tn.esprit.abonnement.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.util.Random;

@Service
@Slf4j
public class PromoCodeService {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final Random random = new Random();

    /**
     * Generate a unique promo code for renewal
     * Format: RENEW-XXXXX
     */
    public String generateRenewalPromoCode() {
        StringBuilder code = new StringBuilder("RENEW-");
        for (int i = 0; i < 5; i++) {
            code.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return code.toString();
    }

    /**
     * Validate and apply promo code discount
     * @param promoCode The promo code to validate
     * @param originalAmount The original amount
     * @return The discounted amount
     */
    public double applyPromoCode(String promoCode, double originalAmount) {
        if (promoCode == null || promoCode.trim().isEmpty()) {
            return originalAmount;
        }

        String code = promoCode.trim().toUpperCase();
        
        // Renewal codes: 15% off
        if (code.startsWith("RENEW-")) {
            log.info("✓ Applied RENEW promo code: {} - 15% discount", code);
            return originalAmount * 0.85; // 15% off
        }
        
        // Welcome codes: 10% off
        if (code.equals("WELCOME10")) {
            log.info("✓ Applied WELCOME10 promo code - 10% discount");
            return originalAmount * 0.90;
        }
        
        // Student codes: 20% off
        if (code.equals("STUDENT20")) {
            log.info("✓ Applied STUDENT20 promo code - 20% discount");
            return originalAmount * 0.80;
        }
        
        // Summer codes: 50% off
        if (code.equals("SUMMER50")) {
            log.info("✓ Applied SUMMER50 promo code - 50% discount");
            return originalAmount * 0.50;
        }
        
        log.warn("✗ Invalid promo code: {}", code);
        return originalAmount;
    }

    /**
     * Get discount percentage for a promo code
     */
    public double getDiscountPercentage(String promoCode) {
        if (promoCode == null || promoCode.trim().isEmpty()) {
            return 0.0;
        }

        String code = promoCode.trim().toUpperCase();
        
        if (code.startsWith("RENEW-")) return 15.0;
        if (code.equals("WELCOME10")) return 10.0;
        if (code.equals("STUDENT20")) return 20.0;
        if (code.equals("SUMMER50")) return 50.0;
        
        return 0.0;
    }

    /**
     * Check if promo code is valid
     */
    public boolean isValidPromoCode(String promoCode) {
        if (promoCode == null || promoCode.trim().isEmpty()) {
            return false;
        }

        String code = promoCode.trim().toUpperCase();
        
        return code.startsWith("RENEW-") || 
               code.equals("WELCOME10") || 
               code.equals("STUDENT20") || 
               code.equals("SUMMER50");
    }
}
