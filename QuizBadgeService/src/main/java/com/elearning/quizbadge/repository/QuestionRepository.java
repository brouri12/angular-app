package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Question entity operations.
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    /**
     * Find questions by course ID.
     */
    List<Question> findByCourseId(Long courseId);
    
    /**
     * Find active questions by course ID.
     */
    List<Question> findByCourseIdAndIsActive(Long courseId, Boolean isActive);
    
    /**
     * Find questions by course ID with pagination.
     */
    Page<Question> findByCourseId(Long courseId, Pageable pageable);
    
    /**
     * Find question by order number within a course.
     */
    Optional<Question> findByCourseIdAndOrderNumber(Long courseId, Integer orderNumber);
    
    /**
     * Find questions by difficulty level.
     */
    List<Question> findByDifficultyLevel(Question.DifficultyLevel difficultyLevel);
    
    /**
     * Count questions by course ID.
     */
    Long countByCourseId(Long courseId);
    
    /**
     * Get random questions for a quiz.
     */
    @Query("SELECT q FROM Question q WHERE q.courseId = :courseId AND q.isActive = true ORDER BY RANDOM()")
    List<Question> findRandomQuestions(@Param("courseId") Long courseId, Pageable pageable);
}
