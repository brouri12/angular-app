package com.elearning.quizbadge.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Simple test controller for quiz-badge-service.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TestController {
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Quiz Badge Service");
        response.put("port", "8082");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "quiz-badge-service");
        
        return ResponseEntity.ok(response);
    }
}
