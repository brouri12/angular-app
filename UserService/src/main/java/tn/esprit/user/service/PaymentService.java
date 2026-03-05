package tn.esprit.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.user.dto.PaymentRequest;
import tn.esprit.user.entity.Payment;
import tn.esprit.user.repository.PaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final UserSubscriptionService subscriptionService;
    
    @Transactional
    public Payment createPayment(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setIdUser(request.getIdUser());
        payment.setIdAbonnement(request.getIdAbonnement());
        payment.setNomClient(request.getNomClient());
        payment.setEmailClient(request.getEmailClient());
        payment.setTypeAbonnement(request.getTypeAbonnement());
        payment.setMontant(request.getMontant());
        payment.setMethodePaiement(request.getMethodePaiement());
        payment.setReferenceTransaction(request.getReferenceTransaction());
        payment.setStripePaymentId(request.getStripePaymentId());
        
        // Set status based on payment method
        if ("virement".equals(request.getMethodePaiement())) {
            payment.setStatut("En attente");
        } else {
            payment.setStatut("Validé");
        }
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment created: {}", savedPayment.getId_payment());
        
        // If payment is validated (credit card/PayPal), create subscription immediately
        if ("Validé".equals(savedPayment.getStatut())) {
            createSubscriptionForPayment(savedPayment);
        }
        
        return savedPayment;
    }
    
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    public List<Payment> getPendingPayments() {
        return paymentRepository.findByStatutOrderByDatePaiementDesc("En attente");
    }
    
    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepository.findByIdUser(userId);
    }
    
    public List<Payment> getValidatedPayments() {
        return paymentRepository.findByStatut("Validé");
    }
    
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }
    
    @Transactional
    public Payment updateReceiptUrl(Long paymentId, String receiptUrl) {
        Payment payment = getPaymentById(paymentId);
        payment.setReceiptUrl(receiptUrl);
        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Receipt URL updated for payment: {}", paymentId);
        return updatedPayment;
    }
    
    @Transactional
    public Payment validatePayment(Long paymentId, Long adminId, String notes) {
        Payment payment = getPaymentById(paymentId);
        payment.setStatut("Validé");
        payment.setDateValidation(LocalDateTime.now());
        payment.setValidatedBy(adminId);
        payment.setNotes(notes);
        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Payment validated: {} by admin: {}", paymentId, adminId);
        
        // Create subscription when payment is validated
        createSubscriptionForPayment(updatedPayment);
        
        return updatedPayment;
    }
    
    @Transactional
    public Payment rejectPayment(Long paymentId, Long adminId, String notes) {
        Payment payment = getPaymentById(paymentId);
        payment.setStatut("Rejeté");
        payment.setDateValidation(LocalDateTime.now());
        payment.setValidatedBy(adminId);
        payment.setNotes(notes);
        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Payment rejected: {} by admin: {}", paymentId, adminId);
        return updatedPayment;
    }
    
    /**
     * Create subscription when payment is validated
     */
    private void createSubscriptionForPayment(Payment payment) {
        try {
            // Determine billing cycle based on amount
            String billingCycle = "MONTHLY";
            if (payment.getMontant() != null && payment.getMontant().compareTo(new BigDecimal("100")) > 0) {
                billingCycle = "ANNUAL";
            }
            
            subscriptionService.createSubscription(
                payment.getIdUser(),
                payment.getIdAbonnement(),
                payment.getTypeAbonnement(),
                payment.getMontant().doubleValue(),
                billingCycle,
                payment.getId_payment()
            );
            
            log.info("Subscription created for payment: {}", payment.getId_payment());
        } catch (Exception e) {
            log.error("Error creating subscription for payment: {}", payment.getId_payment(), e);
            // Don't fail the payment if subscription creation fails
        }
    }
}
