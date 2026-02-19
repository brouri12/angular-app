package com.elearning.quizbadge.controller;

import com.elearning.quizbadge.dto.ResponseDTO;
import com.elearning.quizbadge.service.ResponseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Response operations.
 */
@RestController
@RequestMapping("/api/responses")
@RequiredArgsConstructor
@Slf4j
public class ResponseController {
    
    private final ResponseService responseService;
    
    @PostMapping
    public ResponseEntity<ResponseDTO> submitResponse(@Valid @RequestBody ResponseDTO responseDTO) {
        log.info("POST /api/responses - Submitting response");
        ResponseDTO created = responseService.submitResponse(responseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ResponseDTO>> getResponsesByStudent(@PathVariable Long studentId) {
        log.info("GET /api/responses/student/{}", studentId);
        List<ResponseDTO> responses = responseService.getResponsesByStudent(studentId);
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<ResponseDTO>> getResponsesByQuestion(@PathVariable Long questionId) {
        log.info("GET /api/responses/question/{}", questionId);
        List<ResponseDTO> responses = responseService.getResponsesByQuestion(questionId);
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<List<ResponseDTO>> getResponsesByEnrollment(@PathVariable Long enrollmentId) {
        log.info("GET /api/responses/enrollment/{}", enrollmentId);
        List<ResponseDTO> responses = responseService.getResponsesByEnrollment(enrollmentId);
        return ResponseEntity.ok(responses);
    }
}
