package tn.esprit.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.user.dto.PaymentRequest;
import tn.esprit.user.dto.ValidationRequest;
import tn.esprit.user.entity.Payment;
import tn.esprit.user.service.FileStorageService;
import tn.esprit.user.service.PaymentService;
import tn.esprit.user.service.StripeService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    private final FileStorageService fileStorageService;
    private final StripeService stripeService;
    
    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody PaymentRequest request) {
        log.info("Creating payment for user: {}", request.getIdUser());
        Payment payment = paymentService.createPayment(request);
        return ResponseEntity.ok(payment);
    }
    
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> data) {
        try {
            BigDecimal amount = new BigDecimal(data.get("amount").toString());
            String currency = data.getOrDefault("currency", "usd").toString();
            
            Map<String, String> response = stripeService.createPaymentIntent(amount, currency);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating payment intent", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/upload-receipt")
    public ResponseEntity<Payment> uploadReceipt(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        log.info("Uploading receipt for payment: {}", id);
        
        // Store file
        String fileName = fileStorageService.storeFile(file);
        
        // Update payment with receipt URL
        Payment payment = paymentService.updateReceiptUrl(id, fileName);
        
        return ResponseEntity.ok(payment);
    }
    
    // IMPORTANT: Specific paths MUST come before path variables to avoid routing conflicts
    
    @GetMapping("/pending")
    public ResponseEntity<List<Payment>> getPendingPayments() {
        log.info("Fetching pending payments");
        return ResponseEntity.ok(paymentService.getPendingPayments());
    }
    
    @GetMapping("/validated")
    public ResponseEntity<List<Payment>> getValidatedPayments() {
        log.info("Fetching validated payments for reminder service");
        return ResponseEntity.ok(paymentService.getValidatedPayments());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId));
    }
    
    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
    
    // Path variable endpoints MUST come last
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
    
    @PutMapping("/{id}/validate")
    public ResponseEntity<Payment> validatePayment(
            @PathVariable Long id,
            @RequestBody ValidationRequest request) {
        log.info("Validating payment: {} by admin: {}", id, request.getAdminId());
        Payment payment = paymentService.validatePayment(id, request.getAdminId(), request.getNotes());
        return ResponseEntity.ok(payment);
    }
    
    @PutMapping("/{id}/reject")
    public ResponseEntity<Payment> rejectPayment(
            @PathVariable Long id,
            @RequestBody ValidationRequest request) {
        log.info("Rejecting payment: {} by admin: {}", id, request.getAdminId());
        Payment payment = paymentService.rejectPayment(id, request.getAdminId(), request.getNotes());
        return ResponseEntity.ok(payment);
    }
    
    @GetMapping("/receipt/{fileName:.+}")
    public ResponseEntity<Resource> downloadReceipt(@PathVariable String fileName) {
        log.info("Downloading receipt: {}", fileName);
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        
        String contentType = "application/octet-stream";
        if (fileName.endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (fileName.endsWith(".png")) {
            contentType = "image/png";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
