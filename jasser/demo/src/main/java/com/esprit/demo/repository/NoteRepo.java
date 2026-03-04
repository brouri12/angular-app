package com.esprit.demo.repository;

import com.esprit.demo.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepo extends JpaRepository<Note, Long> {
    
    /**
     * Get all notes for a specific evaluation
     */
    @Query("SELECT n FROM Note n WHERE n.evaluation.idEval = :evalId")
    List<Note> findByEvaluationId(@Param("evalId") Long evalId);
    
    /**
     * Calculate total score for an evaluation
     * Returns the sum of all note values
     */
    @Query("SELECT COALESCE(SUM(n.value), 0.0) FROM Note n WHERE n.evaluation.idEval = :evalId")
    Double calculateTotalScore(@Param("evalId") Long evalId);
    
    /**
     * Get evaluation result with dynamic classification
     * Uses JPQL CASE WHEN for smart classification
     * Returns: {totalScore, classification}
     */
    @Query("SELECT " +
           "COALESCE(SUM(n.value), 0.0) as totalScore, " +
           "CASE " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 16 THEN 'Excellent' " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 10 THEN 'Good' " +
           "  ELSE 'Weak' " +
           "END as classification " +
           "FROM Note n " +
           "WHERE n.evaluation.idEval = :evalId")
    Object[] getEvaluationResultWithClassification(@Param("evalId") Long evalId);
    
    /**
     * Get all evaluation results with classifications
     * Returns list of: {evaluationId, totalScore, classification}
     */
    @Query("SELECT " +
           "n.evaluation.idEval as evaluationId, " +
           "COALESCE(SUM(n.value), 0.0) as totalScore, " +
           "CASE " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 16 THEN 'Excellent' " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 10 THEN 'Good' " +
           "  ELSE 'Weak' " +
           "END as classification " +
           "FROM Note n " +
           "GROUP BY n.evaluation.idEval")
    List<Object[]> getAllEvaluationResultsWithClassifications();
    
    /**
     * Get score breakdown by section for an evaluation
     */
    @Query("SELECT n.section, COALESCE(SUM(n.value), 0.0) " +
           "FROM Note n " +
           "WHERE n.evaluation.idEval = :evalId " +
           "GROUP BY n.section")
    List<Object[]> getScoreBreakdownBySection(@Param("evalId") Long evalId);
    
    /**
     * Count students by classification level
     */
    @Query("SELECT " +
           "CASE " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 16 THEN 'Excellent' " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 10 THEN 'Good' " +
           "  ELSE 'Weak' " +
           "END as classification, " +
           "COUNT(DISTINCT n.evaluation.idEval) as count " +
           "FROM Note n " +
           "GROUP BY " +
           "CASE " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 16 THEN 'Excellent' " +
           "  WHEN COALESCE(SUM(n.value), 0.0) >= 10 THEN 'Good' " +
           "  ELSE 'Weak' " +
           "END")
    List<Object[]> getClassificationStatistics();
}
