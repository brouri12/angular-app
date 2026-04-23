package com.elearning.reviewtodo.controller;

import com.elearning.reviewtodo.dto.ReviewTodoRequestDto;
import com.elearning.reviewtodo.dto.ReviewTodoResponseDto;
import com.elearning.reviewtodo.service.ReviewTodoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/review-todos")
public class ReviewTodoController {

    private final ReviewTodoService reviewTodoService;

    public ReviewTodoController(ReviewTodoService reviewTodoService) {
        this.reviewTodoService = reviewTodoService;
    }

    @PostMapping
    public ResponseEntity<ReviewTodoResponseDto> create(@Valid @RequestBody ReviewTodoRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewTodoService.create(requestDto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReviewTodoResponseDto>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(reviewTodoService.getByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewTodoResponseDto> update(@PathVariable Long id,
                                                        @Valid @RequestBody ReviewTodoRequestDto requestDto) {
        return ResponseEntity.ok(reviewTodoService.update(id, requestDto));
    }

    @PatchMapping("/{id}/done")
    public ResponseEntity<ReviewTodoResponseDto> markDone(@PathVariable Long id) {
        return ResponseEntity.ok(reviewTodoService.markDone(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reviewTodoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
