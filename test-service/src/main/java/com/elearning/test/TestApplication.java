package com.elearning.test;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Ultra-simple Spring Boot test application.
 */
@SpringBootApplication
@RestController
@CrossOrigin(origins = "*")
public class TestApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(TestApplication.class, args);
    }
    
    @GetMapping("/api/courses/test")
    public ResponseEntity<Map<String, String>> testFormation() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Formation Service");
        response.put("port", "8081");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/api/questions/test")
    public ResponseEntity<Map<String, String>> testQuiz() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Quiz Badge Service");
        response.put("port", "8081");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/actuator/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return ResponseEntity.ok(response);
    }
}
