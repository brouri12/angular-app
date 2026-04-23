package tn.esprit.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forum.entity.Signalement;
import tn.esprit.forum.service.SignalementService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/moderation")
@RequiredArgsConstructor
public class ModerationController {
    
    private final SignalementService signalementService;
    
    @PostMapping("/signalements")
    public ResponseEntity<?> creerSignalement(@RequestBody Signalement signalement) {
        try {
            Signalement saved = signalementService.creerSignalement(signalement);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/signalements/en-attente")
    public ResponseEntity<List<Signalement>> getSignalementsEnAttente() {
        return ResponseEntity.ok(signalementService.getSignalementsEnAttente());
    }
    
    @GetMapping("/signalements/message/{messageId}")
    public ResponseEntity<List<Signalement>> getSignalementsMessage(@PathVariable Long messageId) {
        return ResponseEntity.ok(signalementService.getSignalementsMessage(messageId));
    }
    
    @PutMapping("/signalements/{signalementId}/traiter")
    public ResponseEntity<?> traiterSignalement(
            @PathVariable Long signalementId,
            @RequestParam Long moderateurId,
            @RequestParam String decision,
            @RequestParam(required = false) String commentaire) {
        try {
            Signalement traite = signalementService.traiterSignalement(
                    signalementId, moderateurId, decision, commentaire);
            return ResponseEntity.ok(traite);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/signalements/multiples")
    public ResponseEntity<List<Object[]>> getMessagesAvecMultiplesSignalements() {
        return ResponseEntity.ok(signalementService.getMessagesAvecMultiplesSignalements());
    }
}
