package tn.esprit.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private Long idUser;
    private Long idAbonnement;
    private String nomClient;
    private String emailClient;
    private String typeAbonnement;
    private BigDecimal montant;
    private String methodePaiement;
    private String referenceTransaction;
    private String stripePaymentId;
}
