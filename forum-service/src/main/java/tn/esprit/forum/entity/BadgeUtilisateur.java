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
public class BadgeUtilisateur {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    @Column(name = "utilisateur_id", unique = true)
    private Long utilisateurId;
    
    @NotNull(message = "Le nombre de points est obligatoire")
    @Min(value = 0, message = "Le nombre de points ne peut pas être négatif")
    private Integer points;
    
    @NotBlank(message = "Le niveau de badge est obligatoire")
    @Pattern(regexp = "BRONZE|ARGENT|OR|PLATINE", message = "Le niveau doit être BRONZE, ARGENT, OR ou PLATINE")
    private String niveauBadge;
    
    @NotNull(message = "Le nombre de messages est obligatoire")
    @Min(value = 0, message = "Le nombre de messages ne peut pas être négatif")
    private Integer nombreMessages;
    
    @NotNull(message = "Le nombre de likes reçus est obligatoire")
    @Min(value = 0, message = "Le nombre de likes ne peut pas être négatif")
    private Integer nombreLikesRecus;
    
    @NotNull(message = "Le nombre de réponses est obligatoire")
    @Min(value = 0, message = "Le nombre de réponses ne peut pas être négatif")
    private Integer nombreReponses;
    
    @NotNull(message = "La date de dernière mise à jour est obligatoire")
    private LocalDateTime derniereMiseAJour;
    
    @PrePersist
    protected void onCreate() {
        derniereMiseAJour = LocalDateTime.now();
        if (points == null) points = 0;
        if (nombreMessages == null) nombreMessages = 0;
        if (nombreLikesRecus == null) nombreLikesRecus = 0;
        if (nombreReponses == null) nombreReponses = 0;
        if (niveauBadge == null) niveauBadge = "BRONZE";
    }
    
    @PreUpdate
    protected void onUpdate() {
        derniereMiseAJour = LocalDateTime.now();
        // Calcul automatique du niveau de badge
        if (points >= 1000) {
            niveauBadge = "PLATINE";
        } else if (points >= 500) {
            niveauBadge = "OR";
        } else if (points >= 200) {
            niveauBadge = "ARGENT";
        } else {
            niveauBadge = "BRONZE";
        }
    }
}
