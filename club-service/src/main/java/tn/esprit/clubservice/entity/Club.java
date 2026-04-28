package tn.esprit.clubservice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

@Entity
@Table(name = "clubs")
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_club")
    private Long idClub;

    @NotBlank(message = "nomClub est obligatoire")
    @Column(name = "nom_club", nullable = false)
    private String nomClub;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "type est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClubType type; // ONLINE / PRESENTIEL

    private String ville;

    @Temporal(TemporalType.DATE)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Column(name = "date_creation")
    private Date dateCreation;

    // On stocke seulement le NOM du fichier (ex: club_3_logo.png)
    private String logo;

    @PrePersist
    public void prePersist() {
        if (dateCreation == null) dateCreation = new Date();
    }

    // Getters & Setters
    public Long getIdClub() { return idClub; }
    public void setIdClub(Long idClub) { this.idClub = idClub; }

    public String getNomClub() { return nomClub; }
    public void setNomClub(String nomClub) { this.nomClub = nomClub; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ClubType getType() { return type; }
    public void setType(ClubType type) { this.type = type; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }
}
