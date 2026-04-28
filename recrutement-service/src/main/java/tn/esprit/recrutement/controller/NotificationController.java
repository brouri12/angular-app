package tn.esprit.recrutement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.recrutement.entity.AdminNotification;
import tn.esprit.recrutement.repository.AdminNotificationRepository;

import java.util.List;

@RestController
@RequestMapping("/api/recrutement/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final AdminNotificationRepository notificationRepository;

    // Get all unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<AdminNotification>> getUnread() {
        return ResponseEntity.ok(notificationRepository.findByLuFalseOrderByCreatedAtDesc());
    }

    // Get all notifications (read + unread)
    @GetMapping
    public ResponseEntity<List<AdminNotification>> getAll() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByCreatedAtDesc());
    }

    // Mark one as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok().build();
    }

    // Mark all as read
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        List<AdminNotification> unread = notificationRepository.findByLuFalseOrderByCreatedAtDesc();
        unread.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
