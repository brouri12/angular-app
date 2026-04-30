package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.Response;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Response entity operations.
 */
@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    
    /**
     * Find responses by student ID.
     */
    List<Response> findByStudentId(Long studentId);
    
    /**
     * Find responses by question ID.
     */
    List<Response> findByQuestionId(Long questionId);
    
    /**
     * Find responses by enrollment ID.
     */
    List<Response> findByEnrollmentId(Long enrollmentId);
    
    /**
     * Find responses by student and question.
     */
    List<Response> findByStudentIdAndQuestionId(Long studentId, Long questionId);
    
    /**
     * Find correct responses by student.
     */
    List<Response> findByStudentIdAndIsCorrect(Long studentId, Boolean isCorrect);
    
    /**
     * Count responses by question.
     */
    Long countByQuestionId(Long questionId);
    
    /**
     * Calculate average score for a question.
     */
    @Query("SELECT AVG(r.pointsEarned) FROM Response r WHERE r.questionId = :questionId")
    Double calculateAverageScoreForQuestion(@Param("questionId") Long questionId);
    
    /**
     * Get total points earned by student in a course.
     */
    @Query("SELECT SUM(r.pointsEarned) FROM Response r WHERE r.studentId = :studentId AND r.questionId IN " +
           "(SELECT q.id FROM Question q WHERE q.courseId = :courseId)")
    Integer getTotalPointsByStudentAndCourse(@Param("studentId") Long studentId, @Param("courseId") Long courseId);
}
