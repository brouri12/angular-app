package tn.esprit.forum.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_preference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id", unique = true)
    private Long userId;
    
    @NotNull
    @Column(name = "welcome_emails")
    private Boolean welcomeEmails;
    
    @NotNull
    @Column(name = "reply_notifications")
    private Boolean replyNotifications;
    
    @NotNull
    @Column(name = "weekly_digests")
    private Boolean weeklyDigests;
    
    @NotNull
    @Column(name = "mention_alerts")
    private Boolean mentionAlerts;
    
    @NotNull
    @Column(name = "daily_summaries")
    private Boolean dailySummaries;
    
    @NotNull
    @Column(name = "unread_reminders")
    private Boolean unreadReminders;
    
    @NotNull
    @Column(name = "unsubscribe_all")
    private Boolean unsubscribeAll;
    
    @Column(name = "created_date")
    private LocalDateTime createdDate;
    
    @Column(name = "updated_date")
    private LocalDateTime updatedDate;
    
    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (welcomeEmails == null) welcomeEmails = true;
        if (replyNotifications == null) replyNotifications = true;
        if (weeklyDigests == null) weeklyDigests = true;
        if (mentionAlerts == null) mentionAlerts = true;
        if (dailySummaries == null) dailySummaries = false;
        if (unreadReminders == null) unreadReminders = true;
        if (unsubscribeAll == null) unsubscribeAll = false;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}
