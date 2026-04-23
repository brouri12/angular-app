package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {
    List<QuizAnswer> findByAttemptIdOrderByIdAsc(Long attemptId);
    Optional<QuizAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
