package com.gestions.ramzi.servicefeedback.entities;

import com.gestions.ramzi.servicefeedback.dto.ModuleDTO;
import com.gestions.ramzi.servicefeedback.dto.UserDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "module_id")
    private Long moduleId;

    @Min(1)
    @Max(5)
    private Integer note;

    private String commentaire;

    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private Sentiment sentiment;  // POSITIF, NEUTRE, NEGATIF

    @Transient
    private UserDTO user; // récupéré via Feign Client

    @Transient
    private ModuleDTO module; // récupéré via un autre service si nécessaire
}
