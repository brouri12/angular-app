package tn.esprit.clubservice.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "club_chat_messages")
public class ClubChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_club", nullable = false)
    private Long idClub;

    @Column(name = "id_user", nullable = false)
    private Long idUser;

    @Column(name = "sender_name", nullable = false, length = 200)
    private String senderName;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdClub() { return idClub; }
    public void setIdClub(Long idClub) { this.idClub = idClub; }

    public Long getIdUser() { return idUser; }
    public void setIdUser(Long idUser) { this.idUser = idUser; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
