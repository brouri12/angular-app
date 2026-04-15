package com.gestions.ramzi.servicefeedback.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity pour les pièces jointes des réclamations
 */
@Entity
@Table(name = "pieces_jointes")
public class PieceJointe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Column(name = "type_contenu")
    private String typeContenu;

    @Column(name = "chemin_fichier")
    private String cheminFichier;

    @Column(name = "taille_fichier")
    private Long tailleFichier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclamation_id")
    private Reclamation reclamation;

    @Column(name = "date_upload")
    private LocalDateTime dateUpload;

    public PieceJointe() {
        this.dateUpload = LocalDateTime.now();
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomFichier() {
        return nomFichier;
    }

    public void setNomFichier(String nomFichier) {
        this.nomFichier = nomFichier;
    }

    public String getTypeContenu() {
        return typeContenu;
    }

    public void setTypeContenu(String typeContenu) {
        this.typeContenu = typeContenu;
    }

    public String getCheminFichier() {
        return cheminFichier;
    }

    public void setCheminFichier(String cheminFichier) {
        this.cheminFichier = cheminFichier;
    }

    public Long getTailleFichier() {
        return tailleFichier;
    }

    public void setTailleFichier(Long tailleFichier) {
        this.tailleFichier = tailleFichier;
    }

    public Reclamation getReclamation() {
        return reclamation;
    }

    public void setReclamation(Reclamation reclamation) {
        this.reclamation = reclamation;
    }

    public LocalDateTime getDateUpload() {
        return dateUpload;
    }

    public void setDateUpload(LocalDateTime dateUpload) {
        this.dateUpload = dateUpload;
    }
}

