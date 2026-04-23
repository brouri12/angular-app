package com.elearning.reviewtodo.service;

import com.elearning.reviewtodo.dto.ReviewTodoRequestDto;
import com.elearning.reviewtodo.dto.ReviewTodoResponseDto;

import java.util.List;

public interface ReviewTodoService {

    ReviewTodoResponseDto create(ReviewTodoRequestDto requestDto);

    List<ReviewTodoResponseDto> getByUserId(Long userId);

    ReviewTodoResponseDto update(Long id, ReviewTodoRequestDto requestDto);

    ReviewTodoResponseDto markDone(Long id);

    void delete(Long id);
}
