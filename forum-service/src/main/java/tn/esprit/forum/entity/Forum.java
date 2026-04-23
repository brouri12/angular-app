package tn.esprit.forum.entity;

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
public class Forum {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 5, max = 100, message = "Le titre doit contenir entre 5 et 100 caractères")
    private String titre;
    
    @NotBlank(message = "La description est obligatoire")
    @Size(min = 10, max = 1000, message = "La description doit contenir entre 10 et 1000 caractères")
    @Column(length = 1000)
    private String description;
    
    @NotNull(message = "La date de création est obligatoire")
    @PastOrPresent(message = "La date de création ne peut pas être dans le futur")
    private LocalDate date_creation;
    
    @NotNull(message = "L'ID du créateur est obligatoire")
    @Positive(message = "L'ID du créateur doit être positif")
    private Long cree_par;
    
    @NotBlank(message = "Le niveau est obligatoire")
    @Pattern(regexp = "L1|L2|L3|M1|M2", message = "Le niveau doit être L1, L2, L3, M1 ou M2")
    private String niveau;
    
    @NotBlank(message = "Le groupe est obligatoire")
    @Size(min = 2, max = 50, message = "Le groupe doit contenir entre 2 et 50 caractères")
    private String groupe;
    
    @NotBlank(message = "Le cours est obligatoire")
    @Size(min = 3, max = 100, message = "Le cours doit contenir entre 3 et 100 caractères")
    private String cours;
    
    @NotBlank(message = "Le statut est obligatoire")
    @Pattern(regexp = "OUVERT|FERME|ARCHIVE", message = "Le statut doit être OUVERT, FERME ou ARCHIVE")
    private String statut; // OUVERT, FERME, ARCHIVE
    
    @OneToMany(mappedBy = "forum", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MessageForum> messages;
}
