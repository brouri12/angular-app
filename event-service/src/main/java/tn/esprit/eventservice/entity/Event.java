package tn.esprit.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.text.SimpleDateFormat;
import java.util.Date;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEvent;

    @NotNull(message = "The title of the event cannot be empty.")
    private String title;

    @NotNull(message = "The description cannot be empty.")
    private String description;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "The type of the event cannot be empty.")
    private EventType type;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "The mode of the event cannot be empty.")
    private EventMode mode;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @Temporal(TemporalType.DATE)
    private Date eventDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    @Temporal(TemporalType.TIME)
    private Date startTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    @Temporal(TemporalType.TIME)
    private Date endTime;

    @NotNull(message = "The location of the event cannot be empty.")
    private String location;

    @NotNull(message = "The capacity of the event cannot be empty.")
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "The required level of the event cannot be empty.")
    private EventLevel requiredLevel;

    private Long clubId;

    /** Club qui sponsorise cet événement (un seul club possible) */
    private Long sponsorClubId;

    /** Date/heure du sponsoring — utilisée par le scheduler */
    @Temporal(TemporalType.TIMESTAMP)
    private Date sponsoredAt;

    // ✅ NEW: Status OPEN/CLOSED
    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.OPEN;

    /**
     * Ancienne colonne MySQL encore présente sur certaines bases ({@code closed} NOT NULL sans défaut).
     * Hibernate doit l’inclure à l’INSERT sous peine d’erreur SQL 1364. Non exposée au JSON (utiliser {@code status}).
     */
    @JsonIgnore
    @Column(name = "closed", nullable = false)
    private Boolean closed = false;

    /** Optional GPS coordinates chosen on the map (WGS84). */
    private Double latitude;
    private Double longitude;


    @PrePersist
    @PreUpdate
    private void validateEventTimes() {

        if (startTime != null && endTime != null && startTime.after(endTime)) {
            throw new IllegalArgumentException("The start time cannot be after the end time.");
        }

        // ❌ IMPORTANT: on NE BLOQUE PAS date passée ici
        // sinon "CLOSED automatique" ne sert à rien.

        if (capacity != null && capacity <= 0) {
            // tu peux laisser ça si tu veux empêcher capacity<=0 à la création
            // mais si tu veux autoriser 0 => event CLOSED, commente cette ligne.
            // throw new IllegalArgumentException("The capacity must be positive.");
        }

        if (eventDate != null) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            String formattedDate = sdf.format(eventDate);
            try {
                sdf.parse(formattedDate);
            } catch (Exception e) {
                throw new IllegalArgumentException("The event date must be in the format YYYY-MM-DD.");
            }
        }

        if (status != null) {
            closed = (status == EventStatus.CLOSED);
        }
    }

    // Getters/Setters
    public Long getIdEvent() { return idEvent; }
    public void setIdEvent(Long idEvent) { this.idEvent = idEvent; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public EventType getType() { return type; }
    public void setType(EventType type) { this.type = type; }

    public EventMode getMode() { return mode; }
    public void setMode(EventMode mode) { this.mode = mode; }

    public Date getEventDate() { return eventDate; }
    public void setEventDate(Date eventDate) { this.eventDate = eventDate; }

    public Date getStartTime() { return startTime; }
    public void setStartTime(Date startTime) { this.startTime = startTime; }

    public Date getEndTime() { return endTime; }
    public void setEndTime(Date endTime) { this.endTime = endTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public EventLevel getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(EventLevel requiredLevel) { this.requiredLevel = requiredLevel; }

    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }

    public Long getSponsorClubId() { return sponsorClubId; }
    public void setSponsorClubId(Long sponsorClubId) { this.sponsorClubId = sponsorClubId; }

    public Date getSponsoredAt() { return sponsoredAt; }
    public void setSponsoredAt(Date sponsoredAt) { this.sponsoredAt = sponsoredAt; }

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    @JsonIgnore
    public Boolean getClosed() { return closed; }
    @JsonIgnore
    public void setClosed(Boolean closed) { this.closed = closed; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

}