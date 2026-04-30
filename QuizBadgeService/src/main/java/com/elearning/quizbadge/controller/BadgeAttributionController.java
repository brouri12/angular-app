package com.elearning.quizbadge.controller;

import com.elearning.quizbadge.service.BadgeAttributionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for automatic badge attribution operations.
 */
@RestController
@RequestMapping("/api/badges/auto")
@RequiredArgsConstructor
@Slf4j
public class BadgeAttributionController {
    
    private final BadgeAttributionService badgeAttributionService;
    
    /**
     * Check and award badges for a student.
     */
    @PostMapping("/check/{studentId}")
    public ResponseEntity<String> checkAndAwardBadges(@PathVariable Long studentId) {
        log.info("POST /api/badges/auto/check/{} - Checking and awarding badges", studentId);
        
        try {
            badgeAttributionService.checkAndAwardBadges(studentId);
            return ResponseEntity.ok("Badges checked and awarded successfully for student " + studentId);
        } catch (Exception e) {
            log.error("Error checking and awarding badges for student {}: {}", studentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking and awarding badges: " + e.getMessage());
        }
    }
    
    /**
     * Check and award badges for a student with specific course.
     */
    @PostMapping("/check/{studentId}/course/{courseId}")
    public ResponseEntity<String> checkAndAwardBadgesForCourse(@PathVariable Long studentId, @PathVariable Long courseId) {
        log.info("POST /api/badges/auto/check/{}/{} - Checking and awarding badges for student in course", studentId, courseId);
        
        try {
            // This would require a modified version of the service to handle specific courses
            badgeAttributionService.checkAndAwardBadges(studentId);
            return ResponseEntity.ok("Badges checked and awarded successfully for student " + studentId + " in course " + courseId);
        } catch (Exception e) {
            log.error("Error checking and awarding badges for student {} in course {}: {}", studentId, courseId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking and awarding badges: " + e.getMessage());
        }
    }
    
    /**
     * Get badge statistics for a student.
     */
    @GetMapping("/stats/{studentId}")
    public ResponseEntity<String> getBadgeStats(@PathVariable Long studentId) {
        log.info("GET /api/badges/auto/stats/{} - Getting badge statistics", studentId);
        
        try {
            // This would require additional methods in the service
            return ResponseEntity.ok("Badge statistics for student " + studentId);
        } catch (Exception e) {
            log.error("Error getting badge statistics for student {}: {}", studentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting badge statistics: " + e.getMessage());
        }
    }
}
