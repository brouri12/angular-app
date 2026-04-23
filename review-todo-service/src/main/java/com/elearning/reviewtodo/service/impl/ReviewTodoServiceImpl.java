package com.elearning.reviewtodo.service.impl;

import com.elearning.reviewtodo.dto.ReviewTodoRequestDto;
import com.elearning.reviewtodo.dto.ReviewTodoResponseDto;
import com.elearning.reviewtodo.entity.ReviewStatus;
import com.elearning.reviewtodo.entity.ReviewTodo;
import com.elearning.reviewtodo.exception.ResourceNotFoundException;
import com.elearning.reviewtodo.repository.ReviewTodoRepository;
import com.elearning.reviewtodo.service.ReviewTodoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReviewTodoServiceImpl implements ReviewTodoService {

    private final ReviewTodoRepository reviewTodoRepository;

    public ReviewTodoServiceImpl(ReviewTodoRepository reviewTodoRepository) {
        this.reviewTodoRepository = reviewTodoRepository;
    }

    @Override
    public ReviewTodoResponseDto create(ReviewTodoRequestDto requestDto) {
        ReviewTodo todo = new ReviewTodo();
        todo.setUserId(requestDto.getUserId());
        todo.setQuestionId(requestDto.getQuestionId());
        todo.setChapterTitle(requestDto.getChapterTitle());
        todo.setQuestionTitle(requestDto.getQuestionTitle());
        todo.setReviewDate(requestDto.getReviewDate());
        todo.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : ReviewStatus.TODO);

        ReviewTodo saved = reviewTodoRepository.save(todo);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewTodoResponseDto> getByUserId(Long userId) {
        return reviewTodoRepository.findByUserIdOrderByStatusAscReviewDateAscCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public ReviewTodoResponseDto update(Long id, ReviewTodoRequestDto requestDto) {
        ReviewTodo todo = reviewTodoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review todo not found with id: " + id));

        todo.setUserId(requestDto.getUserId());
        todo.setQuestionId(requestDto.getQuestionId());
        todo.setChapterTitle(requestDto.getChapterTitle());
        todo.setQuestionTitle(requestDto.getQuestionTitle());
        todo.setReviewDate(requestDto.getReviewDate());
        todo.setStatus(requestDto.getStatus() != null ? requestDto.getStatus() : todo.getStatus());

        return toDto(reviewTodoRepository.save(todo));
    }

    @Override
    public ReviewTodoResponseDto markDone(Long id) {
        ReviewTodo todo = reviewTodoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review todo not found with id: " + id));

        todo.setStatus(ReviewStatus.DONE);
        return toDto(reviewTodoRepository.save(todo));
    }

    @Override
    public void delete(Long id) {
        if (!reviewTodoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review todo not found with id: " + id);
        }
        reviewTodoRepository.deleteById(id);
    }

    private ReviewTodoResponseDto toDto(ReviewTodo entity) {
        ReviewTodoResponseDto dto = new ReviewTodoResponseDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setQuestionId(entity.getQuestionId());
        dto.setChapterTitle(entity.getChapterTitle());
        dto.setQuestionTitle(entity.getQuestionTitle());
        dto.setReviewDate(entity.getReviewDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
