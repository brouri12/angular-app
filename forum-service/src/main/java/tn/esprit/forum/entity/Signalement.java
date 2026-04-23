package tn.esprit.forum.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Signalement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'ID du message est obligatoire")
    @Column(name = "message_id")
    private Long messageId;
    
    @NotNull(message = "L'ID du signaleur est obligatoire")
    @Column(name = "signale_par")
    private Long signalePar;
    
    @NotBlank(message = "Le motif est obligatoire")
    @Size(min = 10, max = 500, message = "Le motif doit contenir entre 10 et 500 caractères")
    @Column(length = 500)
    private String motif;
    
    @NotBlank(message = "Le type est obligatoire")
    @Pattern(regexp = "SPAM|INAPPROPRIE|HARCÈLEMENT|AUTRE", message = "Le type doit être SPAM, INAPPROPRIE, HARCÈLEMENT ou AUTRE")
    private String type;
    
    @NotNull(message = "La date du signalement est obligatoire")
    private LocalDateTime dateSignalement;
    
    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "EN_ATTENTE|TRAITE|REJETE", message = "Le statut doit être EN_ATTENTE, TRAITE ou REJETE")
    private String statut;
    
    @Column(name = "traite_par")
    private Long traitePar;
    
    private LocalDateTime dateTraitement;
    
    @Column(length = 500)
    private String commentaireModerateur;
    
    @PrePersist
    protected void onCreate() {
        dateSignalement = LocalDateTime.now();
        if (statut == null) {
            statut = "EN_ATTENTE";
        }
    }
}
