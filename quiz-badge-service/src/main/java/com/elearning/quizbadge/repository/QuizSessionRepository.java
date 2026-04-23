package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {
    Optional<QuizSession> findFirstByStudentIdAndQuizIdAndStatusOrderByStartedAtDesc(
            Long studentId, Long quizId, QuizSession.SessionStatus status
    );

    long countByStudentIdAndQuizIdAndStatus(Long studentId, Long quizId, QuizSession.SessionStatus status);

    Optional<QuizSession> findFirstByStudentIdAndQuizIdAndStatusInOrderBySubmittedAtDesc(
            Long studentId, Long quizId, List<QuizSession.SessionStatus> statuses
    );

    long countByStudentIdAndQuizIdAndStatusInAndSubmittedAtBetween(
            Long studentId,
            Long quizId,
            List<QuizSession.SessionStatus> statuses,
            LocalDateTime from,
            LocalDateTime to
    );
}
