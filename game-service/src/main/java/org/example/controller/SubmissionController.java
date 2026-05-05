package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.SubmissionRequest;
import org.example.dto.SubmissionResponse;
import org.example.service.SubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Slf4j
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<SubmissionResponse> submit(@RequestBody SubmissionRequest request) {
        log.info("POST /api/submissions - game={} user={}", request.getGameId(), request.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(submissionService.submit(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<?>> getUserSubmissions(@PathVariable String userId) {
        return ResponseEntity.ok(submissionService.getUserSubmissions(userId));
    }
}
