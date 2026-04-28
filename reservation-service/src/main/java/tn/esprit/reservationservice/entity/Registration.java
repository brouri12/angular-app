package tn.esprit.reservationservice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

@Entity
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRegistration;

    // ✅ seulement l'ID de l'event (microservice friendly)
    @NotNull(message = "Event ID is mandatory")
    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @NotNull(message = "User ID is mandatory")
    private Long userId;

    @Column(name = "user_nom")
    private String nom;

    @Column(name = "user_prenom")
    private String prenom;

    @Temporal(TemporalType.DATE)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date registrationDate;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    // ✅ Date par défaut = aujourd'hui
    @PrePersist
    public void prePersist() {
        if (registrationDate == null) {
            registrationDate = new Date();
        }
        if (status == null) {
            status = RegistrationStatus.PENDING;
        }
    }


    // ===== Getters & Setters =====

    public Long getIdRegistration() {
        return idRegistration;
    }

    public void setIdRegistration(Long idRegistration) {
        this.idRegistration = idRegistration;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Date getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(Date registrationDate) {
        this.registrationDate = registrationDate;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
}
