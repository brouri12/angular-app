package tn.esprit.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forum.entity.LikeMessage;
import tn.esprit.forum.entity.ReponseMessage;
import tn.esprit.forum.service.LikeService;
import tn.esprit.forum.service.ReponseService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/interactions")
@RequiredArgsConstructor
public class InteractionController {
    
    private final LikeService likeService;
    private final ReponseService reponseService;
    
    // ========== LIKES ==========
    
    @PostMapping("/likes/{messageId}/{utilisateurId}")
    public ResponseEntity<?> likerMessage(
            @PathVariable Long messageId,
            @PathVariable Long utilisateurId) {
        try {
            LikeMessage like = likeService.likerMessage(messageId, utilisateurId);
            return ResponseEntity.status(HttpStatus.CREATED).body(like);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/likes/{messageId}/{utilisateurId}")
    public ResponseEntity<?> unlikerMessage(
            @PathVariable Long messageId,
            @PathVariable Long utilisateurId) {
        try {
            likeService.unlikerMessage(messageId, utilisateurId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/likes/{messageId}/count")
    public ResponseEntity<Map<String, Long>> getNombreLikes(@PathVariable Long messageId) {
        Long count = likeService.getNombreLikes(messageId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    @GetMapping("/likes/{messageId}/check/{utilisateurId}")
    public ResponseEntity<Map<String, Boolean>> checkLike(
            @PathVariable Long messageId,
            @PathVariable Long utilisateurId) {
        boolean aLike = likeService.aLike(messageId, utilisateurId);
        return ResponseEntity.ok(Map.of("aLike", aLike));
    }
    
    @GetMapping("/likes/{messageId}")
    public ResponseEntity<List<LikeMessage>> getLikesMessage(@PathVariable Long messageId) {
        return ResponseEntity.ok(likeService.getLikesMessage(messageId));
    }
    
    // ========== REPONSES ==========
    
    @PostMapping("/reponses")
    public ResponseEntity<?> creerReponse(@RequestBody ReponseMessage reponse) {
        try {
            ReponseMessage savedReponse = reponseService.creerReponse(reponse);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/reponses/{messageId}")
    public ResponseEntity<List<ReponseMessage>> getReponsesMessage(@PathVariable Long messageId) {
        return ResponseEntity.ok(reponseService.getReponsesMessage(messageId));
    }
    
    @GetMapping("/reponses/{messageId}/count")
    public ResponseEntity<Map<String, Long>> getNombreReponses(@PathVariable Long messageId) {
        Long count = reponseService.getNombreReponses(messageId);
        return ResponseEntity.ok(Map.of("count", count));
    }
    
    @PutMapping("/reponses/{reponseId}")
    public ResponseEntity<?> modifierReponse(
            @PathVariable Long reponseId,
            @RequestParam String contenu,
            @RequestParam Long utilisateurId) {
        try {
            ReponseMessage reponse = reponseService.modifierReponse(reponseId, contenu, utilisateurId);
            return ResponseEntity.ok(reponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/reponses/{reponseId}")
    public ResponseEntity<?> supprimerReponse(
            @PathVariable Long reponseId,
            @RequestParam Long utilisateurId,
            @RequestParam(defaultValue = "ETUDIANT") String typeUtilisateur) {
        try {
            reponseService.supprimerReponse(reponseId, utilisateurId, typeUtilisateur);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
