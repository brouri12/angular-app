package tn.esprit.abonnement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.abonnement.service.RenewalReminderService;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/renewal")
@CrossOrigin(origins = "*")
@Slf4j
public class RenewalController {

    @Autowired
    private RenewalReminderService renewalReminderService;

    /**
     * Manually trigger renewal reminder check (for testing)
     * POST /api/renewal/trigger
     */
    @PostMapping("/trigger")
    public ResponseEntity<Map<String, String>> triggerRenewalCheck() {
        log.info("🔧 Manual trigger requested for renewal reminders");
        
        renewalReminderService.triggerManualCheck();
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Renewal reminder check triggered successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Clear reminder cache (for testing)
     * POST /api/renewal/clear-cache
     */
    @PostMapping("/clear-cache")
    public ResponseEntity<Map<String, String>> clearCache() {
        log.info("🗑️ Clearing reminder cache");
        
        renewalReminderService.clearReminderCache();
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Reminder cache cleared successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check
     * GET /api/renewal/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Renewal Reminder Service");
        response.put("message", "Service is running");
        
        return ResponseEntity.ok(response);
    }
}
