package tn.esprit.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_payment;
    
    @Column(name = "id_user")
    private Long idUser;
    
    @Column(name = "id_abonnement")
    private Long idAbonnement;
    
    @Column(name = "nom_client")
    private String nomClient;
    
    @Column(name = "email_client")
    private String emailClient;
    
    @Column(name = "type_abonnement")
    private String typeAbonnement;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal montant;
    
    @Column(name = "methode_paiement")
    private String methodePaiement; // carte, paypal, virement
    
    private String statut; // Validé, En attente, Rejeté
    
    @Column(name = "reference_transaction")
    private String referenceTransaction;
    
    @Column(name = "stripe_payment_id")
    private String stripePaymentId;
    
    @Column(name = "receipt_url")
    private String receiptUrl; // For bank transfer receipts
    
    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;
    
    @Column(name = "date_validation")
    private LocalDateTime dateValidation;
    
    @Column(name = "validated_by")
    private Long validatedBy; // Admin user ID
    
    @Column(columnDefinition = "TEXT")
    private String notes; // Admin notes
    
    @PrePersist
    protected void onCreate() {
        datePaiement = LocalDateTime.now();
    }
}
