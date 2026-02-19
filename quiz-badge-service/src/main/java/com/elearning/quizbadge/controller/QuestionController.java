package com.elearning.quizbadge.controller;

import com.elearning.quizbadge.dto.QuestionDTO;
import com.elearning.quizbadge.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for Question operations.
 */
@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class QuestionController {
    
    private final QuestionService questionService;
    
    @PostMapping
    public ResponseEntity<QuestionDTO> createQuestion(@Valid @RequestBody QuestionDTO questionDTO) {
        log.info("POST /api/questions - Creating new question");
        QuestionDTO created = questionService.createQuestion(questionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long id) {
        log.info("GET /api/questions/{}", id);
        QuestionDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }
    
    @GetMapping
    public ResponseEntity<Page<QuestionDTO>> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET /api/questions - page: {}, size: {}", page, size);
        Page<QuestionDTO> questions = questionService.getAllQuestions(page, size);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuestionDTO>> getQuestionsByCourse(@PathVariable Long courseId) {
        log.info("GET /api/questions/course/{}", courseId);
        List<QuestionDTO> questions = questionService.getQuestionsByCourse(courseId);
        return ResponseEntity.ok(questions);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionDTO questionDTO) {
        log.info("PUT /api/questions/{}", id);
        QuestionDTO updated = questionService.updateQuestion(id, questionDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        log.info("DELETE /api/questions/{}", id);
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Test endpoint to verify service is running.
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        log.info("GET /api/questions/test - Service test endpoint called");
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Quiz Badge Service");
        response.put("port", "8082");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
}
