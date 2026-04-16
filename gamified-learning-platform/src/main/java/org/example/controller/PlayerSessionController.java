package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.PlayerSession;
import org.example.service.PlayerSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
public class PlayerSessionController {

    private final PlayerSessionService sessionService;

    /** GET /api/session — get or create session for default-user */
    @GetMapping
    public ResponseEntity<PlayerSession> getSession() {
        return ResponseEntity.ok(sessionService.getOrCreate("default-user"));
    }

    /** GET /api/session/{userId} — get session for specific user */
    @GetMapping("/{userId}")
    public ResponseEntity<PlayerSession> getSessionByUser(@PathVariable String userId) {
        return ResponseEntity.ok(sessionService.getOrCreate(userId));
    }

    /** POST /api/session/{userId}/reset — reset session */
    @PostMapping("/{userId}/reset")
    public ResponseEntity<PlayerSession> resetSession(@PathVariable String userId) {
        return ResponseEntity.ok(sessionService.resetSession(userId));
    }
}
