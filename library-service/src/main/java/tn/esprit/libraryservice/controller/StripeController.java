package tn.esprit.libraryservice.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.libraryservice.entity.Book;
import tn.esprit.libraryservice.entity.Purchase;
import tn.esprit.libraryservice.repository.BookRepository;
import tn.esprit.libraryservice.repository.PurchaseRepository;
import tn.esprit.libraryservice.service.MarketplaceService;

import java.util.Map;

@RestController
@RequestMapping("/library/stripe")
public class StripeController {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private MarketplaceService marketplaceService;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Returns the Stripe publishable key for the frontend to initialise Stripe.js
     */
    @GetMapping("/config")
    public Map<String, String> config() {
        return Map.of("publishableKey", stripePublishableKey);
    }

    /**
     * Creates a Stripe PaymentIntent for a book purchase.
     * Body: { "bookId": 1, "userId": 1 }
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Long> body) {
        Long bookId = body.get("bookId");
        Long userId = body.get("userId");

        if (bookId == null || userId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "bookId and userId are required"));
        }

        // Check already purchased
        if (purchaseRepository.existsByUserIdAndBookId(userId, bookId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Book already purchased"));
        }

        Book book = bookRepository.findById(bookId).orElse(null);
        if (book == null) {
            return ResponseEntity.notFound().build();
        }

        if (book.getPrice() == null || book.getPrice() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Book has no valid price"));
        }

        try {
            // Stripe amounts are in cents
            long amountCents = Math.round(book.getPrice() * 100);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountCents)
                    .setCurrency("usd")
                    .setDescription("Purchase: " + book.getTitle())
                    .putMetadata("bookId", String.valueOf(bookId))
                    .putMetadata("userId", String.valueOf(userId))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return ResponseEntity.ok(Map.of(
                    "clientSecret", intent.getClientSecret(),
                    "amount", amountCents,
                    "currency", "usd"
            ));
        } catch (StripeException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Called after successful Stripe payment to record the purchase.
     * Body: { "bookId": 1, "userId": 1, "paymentIntentId": "pi_xxx" }
     */
    @PostMapping("/confirm-purchase")
    public ResponseEntity<?> confirmPurchase(@RequestBody Map<String, Object> body) {
        Long bookId = Long.valueOf(body.get("bookId").toString());
        Long userId = Long.valueOf(body.get("userId").toString());

        try {
            Purchase purchase = marketplaceService.buyPdf(userId, bookId);
            return ResponseEntity.ok(purchase);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if a user has purchased a book.
     */
    @GetMapping("/purchased/{userId}/{bookId}")
    public Map<String, Boolean> hasPurchased(@PathVariable Long userId, @PathVariable Long bookId) {
        return Map.of("purchased", purchaseRepository.existsByUserIdAndBookId(userId, bookId));
    }
}
