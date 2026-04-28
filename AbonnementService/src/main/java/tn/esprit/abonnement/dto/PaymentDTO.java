package tn.esprit.abonnement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDTO {
    
    private Long id_payment;
    private Long idUser;
    private Long idAbonnement;
    private String nomClient;
    private String emailClient;
    private String typeAbonnement;
    private BigDecimal montant;
    private String methodePaiement;
    private String statut;
    private LocalDateTime datePaiement;
    private LocalDateTime dateValidation;
    
    public PaymentDTO() {
    }
    
    // Getters and Setters
    public Long getId_payment() {
        return id_payment;
    }
    
    public void setId_payment(Long id_payment) {
        this.id_payment = id_payment;
    }
    
    public Long getIdUser() {
        return idUser;
    }
    
    public void setIdUser(Long idUser) {
        this.idUser = idUser;
    }
    
    public Long getIdAbonnement() {
        return idAbonnement;
    }
    
    public void setIdAbonnement(Long idAbonnement) {
        this.idAbonnement = idAbonnement;
    }
    
    public String getNomClient() {
        return nomClient;
    }
    
    public void setNomClient(String nomClient) {
        this.nomClient = nomClient;
    }
    
    public String getEmailClient() {
        return emailClient;
    }
    
    public void setEmailClient(String emailClient) {
        this.emailClient = emailClient;
    }
    
    public String getTypeAbonnement() {
        return typeAbonnement;
    }
    
    public void setTypeAbonnement(String typeAbonnement) {
        this.typeAbonnement = typeAbonnement;
    }
    
    public BigDecimal getMontant() {
        return montant;
    }
    
    public void setMontant(BigDecimal montant) {
        this.montant = montant;
    }
    
    public String getMethodePaiement() {
        return methodePaiement;
    }
    
    public void setMethodePaiement(String methodePaiement) {
        this.methodePaiement = methodePaiement;
    }
    
    public String getStatut() {
        return statut;
    }
    
    public void setStatut(String statut) {
        this.statut = statut;
    }
    
    public LocalDateTime getDatePaiement() {
        return datePaiement;
    }
    
    public void setDatePaiement(LocalDateTime datePaiement) {
        this.datePaiement = datePaiement;
    }
    
    public LocalDateTime getDateValidation() {
        return dateValidation;
    }
    
    public void setDateValidation(LocalDateTime dateValidation) {
        this.dateValidation = dateValidation;
    }
}
