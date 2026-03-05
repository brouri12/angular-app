package tn.esprit.challenge.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.challenge.dto.SubmissionRequest;
import tn.esprit.challenge.dto.SubmissionResponse;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.service.SubmissionService;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Slf4j
public class SubmissionController {
    
    private final SubmissionService submissionService;
    
    @PostMapping
    public ResponseEntity<SubmissionResponse> submitChallenge(@RequestBody SubmissionRequest request) {
        log.info("POST /api/submissions - Submit challenge {} by user {}", 
            request.getChallengeId(), request.getUserId());
        SubmissionResponse response = submissionService.submitChallenge(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getSubmissionById(@PathVariable Long id) {
        log.info("GET /api/submissions/{} - Get submission by ID", id);
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Submission>> getUserSubmissions(@PathVariable Long userId) {
        log.info("GET /api/submissions/user/{} - Get user submissions", userId);
        return ResponseEntity.ok(submissionService.getUserSubmissions(userId));
    }
    
    @GetMapping("/user/{userId}/total-score")
    public ResponseEntity<Integer> getUserTotalScore(@PathVariable Long userId) {
        log.info("GET /api/submissions/user/{}/total-score - Get user total score", userId);
        return ResponseEntity.ok(submissionService.getUserTotalScore(userId));
    }
}
