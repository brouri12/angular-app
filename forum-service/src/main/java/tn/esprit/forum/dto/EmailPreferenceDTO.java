package tn.esprit.forum.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailPreferenceDTO {
    private Long userId;
    private Boolean welcomeEmails;
    private Boolean replyNotifications;
    private Boolean weeklyDigests;
    private Boolean mentionAlerts;
    private Boolean dailySummaries;
    private Boolean unreadReminders;
    private Boolean unsubscribeAll;
}
