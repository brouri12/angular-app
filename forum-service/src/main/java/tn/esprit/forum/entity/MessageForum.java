package tn.esprit.forum.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "forum")
public class MessageForum {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'ID de l'auteur est obligatoire")
    @Positive(message = "L'ID de l'auteur doit être positif")
    @Column(name = "auteur_id")
    private Long auteurId;
    
    @NotBlank(message = "Le contenu du message est obligatoire")
    @Size(min = 1, max = 2000, message = "Le contenu doit contenir entre 1 et 2000 caractères")
    @Column(length = 2000)
    private String contenu;
    
    private LocalDateTime date_message;
    
    @NotBlank(message = "Le type d'auteur est obligatoire")
    @Pattern(regexp = "ETUDIANT|ENSEIGNANT|ADMIN", message = "Le type d'auteur doit être ETUDIANT, ENSEIGNANT ou ADMIN")
    private String type_auteur; // ETUDIANT, ENSEIGNANT, ADMIN
    
    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "ACTIF|SUPPRIME|MODERE", message = "Le statut doit être ACTIF, SUPPRIME ou MODERE")
    private String statut; // ACTIF, SUPPRIME, MODERE
    
    @ManyToOne
    @JoinColumn(name = "id_forum")
    @JsonIgnore
    private Forum forum;
    
    @OneToMany(mappedBy = "messageForum", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MediaFile> mediaFiles = new ArrayList<>();
}
