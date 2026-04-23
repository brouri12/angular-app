package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByChapterIdOrderByIdAsc(Long chapterId);
}
