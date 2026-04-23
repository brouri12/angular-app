package tn.esprit.recrutement.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import java.time.LocalDate;
import java.util.Base64;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "offre")
public class CandidatureEnseignant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id_candidature")
    private Long id;

    private String nom_candidat;

    private String prenom_candidat;

    @Column
    private String email;

    @Lob
    @Column(name = "cv_pdf", columnDefinition = "LONGBLOB")
    @JsonIgnore
    @Setter(AccessLevel.NONE)
    private byte[] cv_pdf;

    @JsonSetter("cv_pdf")
    public void setCvPdfFromBase64(Object value) {
        if (value == null) {
            this.cv_pdf = null;
        } else if (value instanceof String) {
            try {
                this.cv_pdf = Base64.getDecoder().decode((String) value);
            } catch (IllegalArgumentException e) {
                this.cv_pdf = null;
            }
        }
    }

    @Column(name = "cv_filename")
    private String cv_filename;

    @Column(name = "cv_content_type")
    private String cv_content_type;

    @Column(length = 2000)
    private String lettre_motivation;

    private LocalDate date_candidature;

    private String statut;

    @Column(name = "annees_experience")
    private Integer annees_experience = 0;

    @ManyToOne
    @JoinColumn(name = "offre_id")
    @JsonIgnore
    private OffreRecrutement offre;
}
