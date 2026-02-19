package com.elearning.quizbadge.controller;

import com.elearning.quizbadge.dto.BadgeDTO;
import com.elearning.quizbadge.service.BadgeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Badge operations.
 */
@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@Slf4j
public class BadgeController {
    
    private final BadgeService badgeService;
    
    @PostMapping
    public ResponseEntity<BadgeDTO> awardBadge(@Valid @RequestBody BadgeDTO badgeDTO) {
        log.info("POST /api/badges - Awarding badge");
        BadgeDTO awarded = badgeService.awardBadge(badgeDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(awarded);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BadgeDTO> getBadgeById(@PathVariable Long id) {
        log.info("GET /api/badges/{}", id);
        BadgeDTO badge = badgeService.getBadgeById(id);
        return ResponseEntity.ok(badge);
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<BadgeDTO>> getBadgesByStudent(@PathVariable Long studentId) {
        log.info("GET /api/badges/student/{}", studentId);
        List<BadgeDTO> badges = badgeService.getBadgesByStudent(studentId);
        return ResponseEntity.ok(badges);
    }
    
    @GetMapping("/student/{studentId}/recent")
    public ResponseEntity<List<BadgeDTO>> getRecentBadges(@PathVariable Long studentId) {
        log.info("GET /api/badges/student/{}/recent", studentId);
        List<BadgeDTO> badges = badgeService.getRecentBadges(studentId);
        return ResponseEntity.ok(badges);
    }
    
    @GetMapping("/student/{studentId}/count")
    public ResponseEntity<Long> getBadgeCount(@PathVariable Long studentId) {
        log.info("GET /api/badges/student/{}/count", studentId);
        Long count = badgeService.getBadgeCount(studentId);
        return ResponseEntity.ok(count);
    }

    /**
     * Delete badge by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBadge(@PathVariable Long id) {
        log.info("DELETE /api/badges/{}", id);
        badgeService.deleteBadge(id);
        return ResponseEntity.noContent().build();
    }
}
