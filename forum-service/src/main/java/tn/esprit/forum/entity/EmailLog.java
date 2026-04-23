package tn.esprit.forum.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmailLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id")
    private Long userId;
    
    @NotBlank
    @Column(name = "email_address")
    private String emailAddress;
    
    @NotBlank
    @Column(name = "email_type")
    private String emailType; // WELCOME, REPLY, MENTION, DIGEST, SUMMARY, REMINDER
    
    @Column(name = "subject")
    private String subject;
    
    @NotNull
    @Column(name = "sent_date")
    private LocalDateTime sentDate;
    
    @NotNull
    @Column(name = "success")
    private Boolean success;
    
    @Column(name = "error_message", length = 1000)
    private String errorMessage;
    
    @Column(name = "retry_count")
    private Integer retryCount;
    
    @PrePersist
    protected void onCreate() {
        sentDate = LocalDateTime.now();
        if (retryCount == null) {
            retryCount = 0;
        }
    }
}
