package com.esprit.demo.repository;

import com.esprit.demo.entity.Evaluation;
import com.esprit.demo.entity.EvaluationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationRepo extends JpaRepository<Evaluation, Long> {
    
    // Method query (Spring Data JPA auto-generates the query)
    List<Evaluation> findByStatus(EvaluationStatus status);
    
    // JPQL query - explicitly defined query for finding OPEN evaluations
    @Query("SELECT e FROM Evaluation e WHERE e.status = 'OPEN'")
    List<Evaluation> findOpenEvaluations();
    
    // Alternative JPQL with parameter (more flexible)
    @Query("SELECT e FROM Evaluation e WHERE e.status = :status")
    List<Evaluation> findEvaluationsByStatus(EvaluationStatus status);
}
