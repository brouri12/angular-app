package tn.esprit.forum.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forum.dto.EmailPreferenceDTO;
import tn.esprit.forum.entity.EmailPreference;
import tn.esprit.forum.repository.EmailPreferenceRepository;
import tn.esprit.forum.service.EmailService;

@RestController
@RequestMapping("/api/forum/email")
public class EmailController {
    
    @Autowired
    private EmailPreferenceRepository emailPreferenceRepository;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/preferences")
    public ResponseEntity<EmailPreferenceDTO> createPreferences(@RequestBody EmailPreferenceDTO dto) {
        EmailPreference pref = new EmailPreference();
        pref.setUserId(dto.getUserId());
        pref.setWelcomeEmails(dto.getWelcomeEmails());
        pref.setReplyNotifications(dto.getReplyNotifications());
        pref.setWeeklyDigests(dto.getWeeklyDigests());
        pref.setMentionAlerts(dto.getMentionAlerts());
        pref.setDailySummaries(dto.getDailySummaries());
        pref.setUnreadReminders(dto.getUnreadReminders());
        pref.setUnsubscribeAll(dto.getUnsubscribeAll());
        
        pref = emailPreferenceRepository.save(pref);
        return ResponseEntity.ok(convertToDTO(pref));
    }
    
    @GetMapping("/preferences/{userId}")
    public ResponseEntity<EmailPreferenceDTO> getPreferences(@PathVariable Long userId) {
        return emailPreferenceRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/preferences/{userId}")
    public ResponseEntity<EmailPreferenceDTO> updatePreferences(
            @PathVariable Long userId,
            @RequestBody EmailPreferenceDTO dto) {
        return emailPreferenceRepository.findByUserId(userId)
                .map(pref -> {
                    pref.setWelcomeEmails(dto.getWelcomeEmails());
                    pref.setReplyNotifications(dto.getReplyNotifications());
                    pref.setWeeklyDigests(dto.getWeeklyDigests());
                    pref.setMentionAlerts(dto.getMentionAlerts());
                    pref.setDailySummaries(dto.getDailySummaries());
                    pref.setUnreadReminders(dto.getUnreadReminders());
                    pref.setUnsubscribeAll(dto.getUnsubscribeAll());
                    return emailPreferenceRepository.save(pref);
                })
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/test")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String email,
            @RequestParam(defaultValue = "1") Long userId) {
        try {
            emailService.sendWelcomeEmail(userId, email, "Utilisateur Test");
            return ResponseEntity.ok("Email de test envoyé à " + email);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de l'envoi: " + e.getMessage());
        }
    }
    
    private EmailPreferenceDTO convertToDTO(EmailPreference pref) {
        return new EmailPreferenceDTO(
                pref.getUserId(),
                pref.getWelcomeEmails(),
                pref.getReplyNotifications(),
                pref.getWeeklyDigests(),
                pref.getMentionAlerts(),
                pref.getDailySummaries(),
                pref.getUnreadReminders(),
                pref.getUnsubscribeAll()
        );
    }
}
