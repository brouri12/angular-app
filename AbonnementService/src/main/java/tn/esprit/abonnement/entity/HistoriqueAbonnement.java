package tn.esprit.abonnement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historique_abonnements")
public class HistoriqueAbonnement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_paiement;
    
    @Column(nullable = false, length = 100)
    private String nom_client;
    
    @Column(nullable = false, length = 150)
    private String email_client;
    
    @Column(nullable = false, length = 100)
    private String type_abonnement;
    
    @Column(nullable = false)
    private Double montant;
    
    @Column(length = 50)
    private String methode_paiement;
    
    @Column(unique = true, length = 100)
    private String reference_transaction;
    
    @Column(nullable = false)
    private LocalDateTime date_paiement;
    
    @Column(length = 20)
    private String statut = "Validé";
    
    // Constructeur par défaut
    public HistoriqueAbonnement() {
        this.date_paiement = LocalDateTime.now();
    }
    
    // Constructeur avec paramètres
    public HistoriqueAbonnement(String nom_client, String email_client, String type_abonnement, 
                                Double montant, String methode_paiement, String reference_transaction, String statut) {
        this.nom_client = nom_client;
        this.email_client = email_client;
        this.type_abonnement = type_abonnement;
        this.montant = montant;
        this.methode_paiement = methode_paiement;
        this.reference_transaction = reference_transaction;
        this.statut = statut;
        this.date_paiement = LocalDateTime.now();
    }
    
    // Getters et Setters
    public Long getId_paiement() {
        return id_paiement;
    }
    
    public void setId_paiement(Long id_paiement) {
        this.id_paiement = id_paiement;
    }
    
    public String getNom_client() {
        return nom_client;
    }
    
    public void setNom_client(String nom_client) {
        this.nom_client = nom_client;
    }
    
    public String getEmail_client() {
        return email_client;
    }
    
    public void setEmail_client(String email_client) {
        this.email_client = email_client;
    }
    
    public String getType_abonnement() {
        return type_abonnement;
    }
    
    public void setType_abonnement(String type_abonnement) {
        this.type_abonnement = type_abonnement;
    }
    
    public Double getMontant() {
        return montant;
    }
    
    public void setMontant(Double montant) {
        this.montant = montant;
    }
    
    public String getMethode_paiement() {
        return methode_paiement;
    }
    
    public void setMethode_paiement(String methode_paiement) {
        this.methode_paiement = methode_paiement;
    }
    
    public String getReference_transaction() {
        return reference_transaction;
    }
    
    public void setReference_transaction(String reference_transaction) {
        this.reference_transaction = reference_transaction;
    }
    
    public LocalDateTime getDate_paiement() {
        return date_paiement;
    }
    
    public void setDate_paiement(LocalDateTime date_paiement) {
        this.date_paiement = date_paiement;
    }
    
    public String getStatut() {
        return statut;
    }
    
    public void setStatut(String statut) {
        this.statut = statut;
    }
    
    @Override
    public String toString() {
        return "HistoriqueAbonnement{" +
                "id_paiement=" + id_paiement +
                ", nom_client='" + nom_client + '\'' +
                ", email_client='" + email_client + '\'' +
                ", type_abonnement='" + type_abonnement + '\'' +
                ", montant=" + montant +
                ", statut='" + statut + '\'' +
                '}';
    }
}
