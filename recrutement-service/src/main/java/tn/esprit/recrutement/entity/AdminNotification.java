package tn.esprit.recrutement.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    private int totalEnAttente;

    private Long offreId;

    private String offreTitre;

    private LocalDateTime createdAt;

    private boolean lu;
}
