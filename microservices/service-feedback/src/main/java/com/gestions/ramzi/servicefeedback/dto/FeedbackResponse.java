package com.gestions.ramzi.servicefeedback.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gestions.ramzi.servicefeedback.entities.Feedback;
import com.gestions.ramzi.servicefeedback.entities.Sentiment;

import java.time.LocalDateTime;

/**
 * DTO for API responses so JSON is always serialized correctly.
 */
public class FeedbackResponse {

    private Long id;
    private Long userId;
    private Long moduleId;
    private int note;
    private String commentaire;
    private LocalDateTime date;
    private Sentiment sentiment;
    private UserDTO user;  // Ajout du champ user pour l'intégration

    public FeedbackResponse() {}

    public FeedbackResponse(Long id, Long userId, Long moduleId, int note, String commentaire, LocalDateTime date, Sentiment sentiment, UserDTO user) {
        this.id = id;
        this.userId = userId;
        this.moduleId = moduleId;
        this.note = note;
        this.commentaire = commentaire;
        this.date = date;
        this.sentiment = sentiment;
        this.user = user;
    }

    public static FeedbackResponse from(Feedback f) {
        if (f == null) return null;
        return new FeedbackResponse(
            f.getId(),
            f.getUserId(),
            f.getModuleId(),
            f.getNote(),
            f.getCommentaire(),
            f.getDate(),
            f.getSentiment(),
            null
        );
    }

    @JsonProperty("id")
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @JsonProperty("userId")
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    @JsonProperty("moduleId")
    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

    @JsonProperty("note")
    public int getNote() { return note; }
    public void setNote(int note) { this.note = note; }

    @JsonProperty("commentaire")
    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    @JsonProperty("date")
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    @JsonProperty("sentiment")
    public Sentiment getSentiment() { return sentiment; }
    public void setSentiment(Sentiment sentiment) { this.sentiment = sentiment; }

    @JsonProperty("user")
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }
}

