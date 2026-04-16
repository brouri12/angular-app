package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Health check endpoint for microservice monitoring.
 */
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    /**
     * Basic health check endpoint.
     * GET /health
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "gamified-learning-platform");
        response.put("version", "1.0.0");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * Detailed service info endpoint.
     * GET /health/info
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Gamified English Learning Platform");
        response.put("version", "1.0.0");
        response.put("description", "Production-ready backend for gamified English learning platform for kids");
        response.put("features", new String[]{
            "Multiple game types (Quiz, Memory, Sentence Completion)",
            "JWT authentication with Keycloak",
            "Gamification with XP, levels, and streaks",
            "User progress tracking",
            "RESTful API"
        });
        response.put("endpoints", new String[]{
            "GET /api/games - List all games",
            "GET /api/games/{id} - Get game details",
            "GET /api/games/{id}/play?limit=5 - Get game content",
            "POST /api/games/{id}/submit - Submit answers",
            "GET /api/progress - Get user progress",
            "GET /api/progress/stats - Get user statistics"
        });
        return ResponseEntity.ok(response);
    }
}

