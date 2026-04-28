package com.gestions.ramzi.servicefeedback.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AccessLevel;

import java.time.LocalDateTime;

@Entity
@Table(name = "resolution_action")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResolutionAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reclamation_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    private Reclamation reclamation;

    private String action;

    private String responsable;

    private LocalDateTime dateAction;

    /** For API input: client sends reclamationId in JSON; service sets reclamation from it. */
    @Transient
    @Getter(AccessLevel.NONE)
    @Setter
    private Long reclamationId;

    /** So API responses expose reclamationId (from DB relation or from request). */
    public Long getReclamationId() {
        return reclamation != null ? reclamation.getId() : reclamationId;
    }
}
