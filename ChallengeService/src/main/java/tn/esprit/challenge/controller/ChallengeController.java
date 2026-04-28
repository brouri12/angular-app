package tn.esprit.challenge.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.challenge.dto.ChallengeDTO;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.service.ChallengeService;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
@Slf4j
public class ChallengeController {
    
    private final ChallengeService challengeService;
    
    @GetMapping
    public ResponseEntity<List<ChallengeDTO>> getAllChallenges() {
        log.info("GET /api/challenges - Get all challenges");
        return ResponseEntity.ok(challengeService.getAllChallenges());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDTO> getChallengeById(@PathVariable Long id) {
        log.info("GET /api/challenges/{} - Get challenge by ID", id);
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }
    
    @GetMapping("/{id}/with-answers")
    public ResponseEntity<ChallengeDTO> getChallengeWithAnswers(@PathVariable Long id) {
        log.info("GET /api/challenges/{}/with-answers - Get challenge with answers", id);
        return ResponseEntity.ok(challengeService.getChallengeByIdWithAnswers(id));
    }
    
    @GetMapping("/level/{level}")
    public ResponseEntity<List<ChallengeDTO>> getChallengesByLevel(@PathVariable ProficiencyLevel level) {
        log.info("GET /api/challenges/level/{} - Get challenges by level", level);
        return ResponseEntity.ok(challengeService.getChallengesByLevel(level));
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ChallengeDTO>> getChallengesByType(@PathVariable ChallengeType type) {
        log.info("GET /api/challenges/type/{} - Get challenges by type", type);
        return ResponseEntity.ok(challengeService.getChallengesByType(type));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ChallengeDTO>> searchChallenges(@RequestParam String keyword) {
        log.info("GET /api/challenges/search?keyword={} - Search challenges", keyword);
        return ResponseEntity.ok(challengeService.searchChallenges(keyword));
    }
    
    @GetMapping("/popular")
    public ResponseEntity<List<ChallengeDTO>> getPopularChallenges() {
        log.info("GET /api/challenges/popular - Get popular challenges");
        return ResponseEntity.ok(challengeService.getPopularChallenges());
    }
    
    @PostMapping
    public ResponseEntity<ChallengeDTO> createChallenge(@RequestBody ChallengeDTO dto) {
        log.info("POST /api/challenges - Create new challenge: {}", dto.getTitle());
        ChallengeDTO created = challengeService.createChallenge(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ChallengeDTO> updateChallenge(
            @PathVariable Long id,
            @RequestBody ChallengeDTO dto) {
        log.info("PUT /api/challenges/{} - Update challenge", id);
        return ResponseEntity.ok(challengeService.updateChallenge(id, dto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(@PathVariable Long id) {
        log.info("DELETE /api/challenges/{} - Delete challenge", id);
        challengeService.deleteChallenge(id);
        return ResponseEntity.noContent().build();
    }
}
