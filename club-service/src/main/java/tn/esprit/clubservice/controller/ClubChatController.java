package tn.esprit.clubservice.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.clubservice.dto.PostClubChatMessageRequest;
import tn.esprit.clubservice.entity.ClubChatMessage;
import tn.esprit.clubservice.service.ClubChatService;

import java.util.List;

@RestController
@RequestMapping("/clubs")
public class ClubChatController {

    private final ClubChatService clubChatService;

    public ClubChatController(ClubChatService clubChatService) {
        this.clubChatService = clubChatService;
    }

    @GetMapping("/{clubId}/chat/messages")
    public List<ClubChatMessage> listMessages(
            @PathVariable Long clubId,
            @RequestParam("idUser") Long idUser) {
        return clubChatService.listMessages(clubId, idUser);
    }

    @PostMapping("/{clubId}/chat/messages")
    public ResponseEntity<ClubChatMessage> postMessage(
            @PathVariable Long clubId,
            @Valid @RequestBody PostClubChatMessageRequest body) {
        return ResponseEntity.ok(clubChatService.postMessage(clubId, body));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<String> handleStatus(org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ex.getReason());
    }
}
