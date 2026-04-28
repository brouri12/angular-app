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
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"message_id", "utilisateur_id"}))
public class LikeMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "L'ID du message est obligatoire")
    @Column(name = "message_id")
    private Long messageId;
    
    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    @Column(name = "utilisateur_id")
    private Long utilisateurId;
    
    @NotNull(message = "La date du like est obligatoire")
    private LocalDateTime dateLike;
    
    @PrePersist
    protected void onCreate() {
        dateLike = LocalDateTime.now();
    }
}
