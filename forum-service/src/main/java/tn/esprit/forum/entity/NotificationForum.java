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
public class NotificationForum {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'ID du destinataire est obligatoire")
    @Column(name = "destinataire_id")
    private Long destinataireId;
    
    @NotBlank(message = "Le type de notification est obligatoire")
    @Pattern(regexp = "LIKE|REPONSE|MENTION|SIGNALEMENT|BADGE", message = "Le type doit être LIKE, REPONSE, MENTION, SIGNALEMENT ou BADGE")
    private String type;
    
    @NotBlank(message = "Le message est obligatoire")
    @Size(min = 1, max = 500, message = "Le message doit contenir entre 1 et 500 caractères")
    @Column(length = 500)
    private String message;
    
    @Column(name = "message_id")
    private Long messageId;
    
    @Column(name = "forum_id")
    private Long forumId;
    
    @NotNull(message = "La date de création est obligatoire")
    private LocalDateTime dateCreation;
    
    @NotNull(message = "Le statut de lecture est obligatoire")
    private Boolean lu;
    
    private LocalDateTime dateLecture;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (lu == null) {
            lu = false;
        }
    }
}
