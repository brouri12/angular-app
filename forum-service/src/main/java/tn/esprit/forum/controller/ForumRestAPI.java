package tn.esprit.forum.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forum.entity.Forum;
import tn.esprit.forum.entity.MessageForum;
import tn.esprit.forum.dto.MessageUpdateDTO;
import tn.esprit.forum.service.ForumService;
import tn.esprit.forum.service.MessageForumService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumRestAPI {
    
    private final ForumService forumService;
    private final MessageForumService messageService;
    
    // CRUD FORUM
    
    @GetMapping("/forums")
    public ResponseEntity<List<Forum>> getAllForums() {
        return ResponseEntity.ok(forumService.getAllForums());
    }
    
    @GetMapping("/forums/{id}")
    public ResponseEntity<Forum> getForumById(@PathVariable Long id) {
        return forumService.getForumById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/forums")
    public ResponseEntity<Forum> addForum(@Valid @RequestBody Forum forum) {
        Forum savedForum = forumService.addForum(forum);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedForum);
    }
    
    @PutMapping("/forums/{id}")
    public ResponseEntity<Forum> updateForum(@PathVariable Long id, @Valid @RequestBody Forum forum) {
        return forumService.updateForum(id, forum)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/forums/{id}")
    public ResponseEntity<Void> deleteForum(@PathVariable Long id) {
        if (forumService.deleteForum(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // ========== OPERATIONS SPECIFIQUES ==========
    
    @PatchMapping("/forums/{id}/fermer")
    public ResponseEntity<Forum> fermerForum(@PathVariable Long id) {
        return forumService.fermerForum(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/forums/{id}/rouvrir")
    public ResponseEntity<Forum> rouvrirForum(@PathVariable Long id) {
        return forumService.rouvrirForum(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    @GetMapping("/forums/recherche")
    public ResponseEntity<Page<Forum>> rechercherForums(
            @RequestParam String titre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(forumService.rechercherForums(titre, page, size));
    }
    
    @GetMapping("/forums/niveau/{niveau}")
    public ResponseEntity<List<Forum>> getForumsByNiveau(@PathVariable String niveau) {
        return ResponseEntity.ok(forumService.getForumsByNiveau(niveau));
    }
    
    @GetMapping("/forums/statut/{statut}")
    public ResponseEntity<List<Forum>> getForumsByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(forumService.getForumsByStatut(statut));
    }
    
    // ========== STATISTIQUES ==========
    
    @GetMapping("/forums/plus-actifs")
    public ResponseEntity<List<Forum>> getForumsPlusActifs() {
        return ResponseEntity.ok(forumService.getForumPlusActif());
    }
    
    // ========== GESTION MESSAGES ==========
    
    @GetMapping("/messages/forum/{id}")
    public ResponseEntity<List<MessageForum>> getMessagesByForum(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.getMessagesByForum(id));
    }
    
    @PostMapping("/messages/forum/{forumId}")
    public ResponseEntity<MessageForum> publierMessage(
            @PathVariable Long forumId,
            @Valid @RequestBody MessageForum message) {
        return messageService.publierMessage(forumId, message)
                .map(msg -> ResponseEntity.status(HttpStatus.CREATED).body(msg))
                .orElse(ResponseEntity.badRequest().build());
    }
    
    @GetMapping("/messages/search")
    public ResponseEntity<List<MessageForum>> searchMessages(@RequestParam String keyword) {
        return ResponseEntity.ok(messageService.rechercherMessages(keyword));
    }
    
    @PutMapping("/messages/{id}")
    public ResponseEntity<MessageForum> modifierMessage(
            @PathVariable Long id,
            @RequestBody MessageUpdateDTO dto) {
        try {
            System.out.println("📥 Requête PUT reçue pour message ID: " + id);
            System.out.println("📦 DTO reçu: " + dto);
            System.out.println("📝 Contenu: " + (dto.getContenu() != null ? dto.getContenu() : "NULL"));
            
            if (dto.getContenu() == null || dto.getContenu().trim().isEmpty()) {
                System.out.println("❌ Contenu vide ou null");
                return ResponseEntity.badRequest().build();
            }
            
            System.out.println("✅ Validation OK, appel du service...");
            return messageService.modifierMessage(id, dto.getContenu(), 1L)
                    .map(message -> {
                        System.out.println("✅ Message modifié avec succès: " + message.getId());
                        return ResponseEntity.ok(message);
                    })
                    .orElseGet(() -> {
                        System.out.println("❌ Message non trouvé");
                        return ResponseEntity.notFound().build();
                    });
        } catch (RuntimeException e) {
            System.out.println("❌ Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> supprimerMessage(@PathVariable Long id) {
        messageService.supprimerMessageDefinitif(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/forums/{id}/messages/count")
    public ResponseEntity<Map<String, Long>> compterMessages(@PathVariable Long id) {
        Long count = messageService.compterMessagesParForum(id);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
