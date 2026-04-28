package tn.esprit.recrutement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class OffreRecrutement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 5, max = 150, message = "Le titre doit contenir entre 5 et 150 caractères")
    private String titre;
    
    @NotBlank(message = "La description est obligatoire")
    @Size(min = 20, max = 2000, message = "La description doit contenir entre 20 et 2000 caractères")
    @Column(length = 2000)
    private String description;
    
    @NotBlank(message = "La spécialité est obligatoire")
    @Size(min = 3, max = 100, message = "La spécialité doit contenir entre 3 et 100 caractères")
    private String specialite;
    
    @NotBlank(message = "Le type de contrat est obligatoire")
    @Pattern(regexp = "CDI|CDD|Vacataire", message = "Le type de contrat doit être CDI, CDD ou Vacataire")
    private String type_contrat; // CDI, CDD, Vacataire
    
    @NotNull(message = "Le nombre de postes est obligatoire")
    @Min(value = 1, message = "Le nombre de postes doit être au moins 1")
    @Max(value = 50, message = "Le nombre de postes ne peut pas dépasser 50")
    private Integer nombre_postes;
    
    @NotBlank(message = "Le niveau requis est obligatoire")
    @Size(min = 5, max = 100, message = "Le niveau requis doit contenir entre 5 et 100 caractères")
    private String niveau_requis; // Licence, Master, Doctorat
    
    @NotNull(message = "L'expérience minimale est obligatoire")
    @Min(value = 0, message = "L'expérience minimale ne peut pas être négative")
    @Max(value = 30, message = "L'expérience minimale ne peut pas dépasser 30 ans")
    private Integer experience_min;
    
    @Min(value = 0, message = "Le salaire minimum ne peut pas être négatif")
    private Double salaire_min;
    
    @Min(value = 0, message = "Le salaire maximum ne peut pas être négatif")
    private Double salaire_max;
    
    // date_publication is set automatically by the service — no validation needed
    private LocalDate date_publication;
    
    @NotNull(message = "La date limite est obligatoire")
    @Future(message = "La date limite doit être dans le futur")
    private LocalDate date_limite;
    
    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "OUVERTE|FERMEE|POURVUE", message = "Le statut doit être OUVERTE, FERMEE ou POURVUE")
    private String statut; // OUVERTE, FERMEE, POURVUE
    
    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidatureEnseignant> candidatures;
}
