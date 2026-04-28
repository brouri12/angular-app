package tn.esprit.abonnement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.abonnement.service.PromoCodeService;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/promo")
@CrossOrigin(origins = "*")
@Slf4j
public class PromoCodeController {

    @Autowired
    private PromoCodeService promoCodeService;

    /**
     * Validate a promo code
     * GET /api/promo/validate?code=RENEW-ABC123
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validatePromoCode(@RequestParam String code) {
        log.info("📋 Validating promo code: {}", code);
        
        Map<String, Object> response = new HashMap<>();
        boolean isValid = promoCodeService.isValidPromoCode(code);
        double discount = promoCodeService.getDiscountPercentage(code);
        
        response.put("valid", isValid);
        response.put("code", code);
        response.put("discount", discount);
        response.put("message", isValid ? "Promo code is valid!" : "Invalid promo code");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Apply promo code to calculate discounted price
     * POST /api/promo/apply
     * Body: { "code": "RENEW-ABC123", "amount": 90.00 }
     */
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyPromoCode(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        double amount = ((Number) request.get("amount")).doubleValue();
        
        log.info("💰 Applying promo code: {} to amount: {}", code, amount);
        
        double discountedAmount = promoCodeService.applyPromoCode(code, amount);
        double discount = promoCodeService.getDiscountPercentage(code);
        double savings = amount - discountedAmount;
        
        Map<String, Object> response = new HashMap<>();
        response.put("originalAmount", amount);
        response.put("discountedAmount", discountedAmount);
        response.put("savings", savings);
        response.put("discountPercentage", discount);
        response.put("code", code);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Generate a new renewal promo code (for testing)
     * GET /api/promo/generate
     */
    @GetMapping("/generate")
    public ResponseEntity<Map<String, Object>> generatePromoCode() {
        String code = promoCodeService.generateRenewalPromoCode();
        double discount = 15.0;
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("discount", discount);
        response.put("message", "New promo code generated");
        
        log.info("🎁 Generated new promo code: {}", code);
        
        return ResponseEntity.ok(response);
    }
}
