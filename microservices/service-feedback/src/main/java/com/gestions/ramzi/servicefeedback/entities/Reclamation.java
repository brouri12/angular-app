package com.gestions.ramzi.servicefeedback.entities;

import com.gestions.ramzi.servicefeedback.dto.UserDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reclamation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    private String objet;

    private String description;

    private String status;

    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    @Column(name = "priorite")
    private Priorite priorite = Priorite.MOYENNE; // Valeur par défaut

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie")
    private CategorieReclamation categorie; // Classification automatique IA

    @Transient
    private UserDTO user; // Récupéré via Feign Client
}
