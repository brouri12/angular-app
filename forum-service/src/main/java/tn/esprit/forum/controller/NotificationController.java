package tn.esprit.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forum.entity.NotificationForum;
import tn.esprit.forum.service.NotificationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<NotificationForum>> getNotificationsUtilisateur(
            @PathVariable Long utilisateurId) {
        return ResponseEntity.ok(notificationService.getNotificationsUtilisateur(utilisateurId));
    }
    
    @GetMapping("/utilisateur/{utilisateurId}/non-lues")
    public ResponseEntity<List<NotificationForum>> getNotificationsNonLues(
            @PathVariable Long utilisateurId) {
        return ResponseEntity.ok(notificationService.getNotificationsNonLues(utilisateurId));
    }
    
    @GetMapping("/utilisateur/{utilisateurId}/non-lues/count")
    public ResponseEntity<Map<String, Long>> compterNotificationsNonLues(
            @PathVariable Long utilisateurId) {
        Long count = notificationService.getNombreNotificationsNonLues(utilisateurId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    @PutMapping("/{notificationId}/marquer-lue")
    public ResponseEntity<NotificationForum> marquerCommeLue(@PathVariable Long notificationId) {
        NotificationForum notification = notificationService.marquerCommeLue(notificationId);
        return ResponseEntity.ok(notification);
    }
    
    @PutMapping("/utilisateur/{utilisateurId}/marquer-toutes-lues")
    public ResponseEntity<Void> marquerToutesCommeLues(@PathVariable Long utilisateurId) {
        notificationService.marquerToutesCommeLues(utilisateurId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> supprimerNotification(
            @PathVariable Long notificationId,
            @RequestParam Long utilisateurId) {
        notificationService.supprimerNotification(notificationId, utilisateurId);
        return ResponseEntity.noContent().build();
    }
}
