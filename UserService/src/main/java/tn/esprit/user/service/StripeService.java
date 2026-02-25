package tn.esprit.user.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeService {
    
    @Value("${stripe.secret.key:sk_test_51T4T13CmhqMbGh2ri2eV8M6dUtEkhJEDQT9YNcPmvE4x4kHstlLaxOs4UrCSRlm6UQwtWDzTiaGkRngTaPlxqC1700z6SRofIx}")
    private String stripeSecretKey;
    
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe initialized with API key");
    }
    
    public Map<String, String> createPaymentIntent(BigDecimal amount, String currency) throws StripeException {
        // Convert amount to cents (Stripe uses smallest currency unit)
        long amountInCents = amount.multiply(new BigDecimal(100)).longValue();
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency.toLowerCase())
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();
        
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentIntentId", paymentIntent.getId());
        
        log.info("Payment intent created: {}", paymentIntent.getId());
        return response;
    }
}
