package tn.esprit.planification.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.planification.enums.PlanificationType;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "planifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Planification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPlanification;
    
    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 200)
    private String titre;
    
    @NotNull(message = "Type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlanificationType type;
    
    @NotNull(message = "Date is required")
    @Column(nullable = false)
    private LocalDate date;
    
    @NotNull(message = "Start time is required")
    @Column(nullable = false)
    private LocalTime heureDebut;
    
    @NotNull(message = "End time is required")
    @Column(nullable = false)
    private LocalTime heureFin;
    
    @NotNull(message = "Room is required")
    @ManyToOne
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;
    
    @NotNull(message = "Group is required")
    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;
}
