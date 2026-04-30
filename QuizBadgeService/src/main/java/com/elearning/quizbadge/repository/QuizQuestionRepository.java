package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizIdOrderByOrderNumberAscIdAsc(Long quizId);
}
