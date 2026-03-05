package tn.esprit.challenge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.enums.SubmissionStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    // Find all submissions by user
    List<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId);
    
    // Find all submissions for a challenge
    List<Submission> findByChallengeIdOrderBySubmittedAtDesc(Long challengeId);
    
    // Find user's submission for a specific challenge
    Optional<Submission> findByUserIdAndChallengeId(Long userId, Long challengeId);
    
    // Find submissions requiring manual grading
    List<Submission> findByRequiresManualGradingTrueAndStatusOrderBySubmittedAtAsc(SubmissionStatus status);
    
    // Count user's completed challenges
    Long countByUserIdAndStatus(Long userId, SubmissionStatus status);
    
    // Get user's total score
    @Query("SELECT COALESCE(SUM(s.score), 0) FROM Submission s WHERE s.userId = :userId AND s.status = 'PASSED'")
    Integer getTotalScoreByUserId(Long userId);
    
    // Get user's average score
    @Query("SELECT COALESCE(AVG(s.score), 0.0) FROM Submission s WHERE s.userId = :userId")
    Double getAverageScoreByUserId(Long userId);
    
    // Check if user has attempted a challenge
    boolean existsByUserIdAndChallengeId(Long userId, Long challengeId);
}
