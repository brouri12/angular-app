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
public class ReponseMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'ID du message parent est obligatoire")
    @Column(name = "message_parent_id")
    private Long messageParentId;
    
    @NotNull(message = "L'ID de l'auteur est obligatoire")
    @Column(name = "auteur_id")
    private Long auteurId;
    
    @NotBlank(message = "Le contenu de la réponse est obligatoire")
    @Size(min = 1, max = 2000, message = "Le contenu doit contenir entre 1 et 2000 caractères")
    @Column(length = 2000)
    private String contenu;
    
    @NotNull(message = "La date de réponse est obligatoire")
    private LocalDateTime dateReponse;
    
    @NotBlank(message = "Le type d'auteur est obligatoire")
    @Pattern(regexp = "ETUDIANT|ENSEIGNANT|ADMIN", message = "Le type d'auteur doit être ETUDIANT, ENSEIGNANT ou ADMIN")
    private String typeAuteur;
    
    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "ACTIF|SUPPRIME|MODERE", message = "Le statut doit être ACTIF, SUPPRIME ou MODERE")
    private String statut;
    
    @PrePersist
    protected void onCreate() {
        dateReponse = LocalDateTime.now();
        if (statut == null) {
            statut = "ACTIF";
        }
    }
}
