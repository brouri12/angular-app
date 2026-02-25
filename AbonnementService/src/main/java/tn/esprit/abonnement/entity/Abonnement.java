package tn.esprit.abonnement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "abonnements")
public class Abonnement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_abonnement;
    
    @Column(nullable = false, length = 100)
    private String nom;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Double prix;
    
    @Column(nullable = false)
    private Integer duree_jours;
    
    @Column(length = 50)
    private String niveau_acces;
    
    @Column(nullable = false)
    private Boolean acces_illimite = false;
    
    @Column(nullable = false)
    private Boolean support_prioritaire = false;
    
    @Column(length = 20)
    private String statut = "Actif";
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime date_creation;
    
    // Constructeur par défaut
    public Abonnement() {
        this.date_creation = LocalDateTime.now();
    }
    
    // Constructeur avec paramètres
    public Abonnement(String nom, String description, Double prix, Integer duree_jours, 
                      String niveau_acces, Boolean acces_illimite, Boolean support_prioritaire, String statut) {
        this.nom = nom;
        this.description = description;
        this.prix = prix;
        this.duree_jours = duree_jours;
        this.niveau_acces = niveau_acces;
        this.acces_illimite = acces_illimite;
        this.support_prioritaire = support_prioritaire;
        this.statut = statut;
        this.date_creation = LocalDateTime.now();
    }
    
    // Getters et Setters
    public Long getId_abonnement() {
        return id_abonnement;
    }
    
    public void setId_abonnement(Long id_abonnement) {
        this.id_abonnement = id_abonnement;
    }
    
    public String getNom() {
        return nom;
    }
    
    public void setNom(String nom) {
        this.nom = nom;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Double getPrix() {
        return prix;
    }
    
    public void setPrix(Double prix) {
        this.prix = prix;
    }
    
    public Integer getDuree_jours() {
        return duree_jours;
    }
    
    public void setDuree_jours(Integer duree_jours) {
        this.duree_jours = duree_jours;
    }
    
    public String getNiveau_acces() {
        return niveau_acces;
    }
    
    public void setNiveau_acces(String niveau_acces) {
        this.niveau_acces = niveau_acces;
    }
    
    public Boolean getAcces_illimite() {
        return acces_illimite;
    }
    
    public void setAcces_illimite(Boolean acces_illimite) {
        this.acces_illimite = acces_illimite;
    }
    
    public Boolean getSupport_prioritaire() {
        return support_prioritaire;
    }
    
    public void setSupport_prioritaire(Boolean support_prioritaire) {
        this.support_prioritaire = support_prioritaire;
    }
    
    public String getStatut() {
        return statut;
    }
    
    public void setStatut(String statut) {
        this.statut = statut;
    }
    
    public LocalDateTime getDate_creation() {
        return date_creation;
    }
    
    public void setDate_creation(LocalDateTime date_creation) {
        this.date_creation = date_creation;
    }
    
    @Override
    public String toString() {
        return "Abonnement{" +
                "id_abonnement=" + id_abonnement +
                ", nom='" + nom + '\'' +
                ", prix=" + prix +
                ", duree_jours=" + duree_jours +
                ", statut='" + statut + '\'' +
                '}';
    }
}
