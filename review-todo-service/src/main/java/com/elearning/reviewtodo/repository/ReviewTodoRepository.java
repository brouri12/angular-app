package com.elearning.reviewtodo.repository;

import com.elearning.reviewtodo.entity.ReviewTodo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewTodoRepository extends JpaRepository<ReviewTodo, Long> {
    List<ReviewTodo> findByUserIdOrderByStatusAscReviewDateAscCreatedAtDesc(Long userId);
}
