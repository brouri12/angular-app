package tn.esprit.challenge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.enums.SubmissionStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // ── Basic finders ──────────────────────────────────────────────────────────
    List<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId);
    List<Submission> findByChallengeIdOrderBySubmittedAtDesc(Long challengeId);
    Optional<Submission> findByUserIdAndChallengeId(Long userId, Long challengeId);
    List<Submission> findByRequiresManualGradingTrueAndStatusOrderBySubmittedAtAsc(SubmissionStatus status);
    boolean existsByUserIdAndChallengeId(Long userId, Long challengeId);

    // ── Count queries ──────────────────────────────────────────────────────────
    Long countByUserIdAndStatus(Long userId, SubmissionStatus status);
    Long countByStatus(SubmissionStatus status);
    Long countByChallengeIdAndStatus(Long challengeId, SubmissionStatus status);

    // ── User score calculations ────────────────────────────────────────────────
    @Query("SELECT COALESCE(SUM(s.score), 0) FROM Submission s WHERE s.userId = :userId AND s.status = 'PASSED'")
    Integer getTotalScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(s.score), 0.0) FROM Submission s WHERE s.userId = :userId")
    Double getAverageScoreByUserId(@Param("userId") Long userId);

    // ── User accuracy calculations ─────────────────────────────────────────────
    @Query("SELECT COALESCE(SUM(s.correctAnswers), 0) FROM Submission s WHERE s.userId = :userId")
    Integer getTotalCorrectAnswersByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(s.totalQuestions), 0) FROM Submission s WHERE s.userId = :userId")
    Integer getTotalQuestionsAnsweredByUserId(@Param("userId") Long userId);

    // ── User time calculations ─────────────────────────────────────────────────
    @Query("SELECT COALESCE(AVG(s.completionTime), 0) FROM Submission s WHERE s.userId = :userId AND s.completionTime IS NOT NULL")
    Double getAverageCompletionTimeByUserId(@Param("userId") Long userId);

    @Query("SELECT MIN(s.completionTime) FROM Submission s WHERE s.userId = :userId AND s.completionTime IS NOT NULL AND s.status = 'PASSED'")
    Long getFastestCompletionTimeByUserId(@Param("userId") Long userId);

    // ── Challenge stats calculations ───────────────────────────────────────────
    @Query("SELECT COALESCE(AVG(s.score), 0.0) FROM Submission s WHERE s.challengeId = :challengeId")
    Double getAverageScoreByChallengeId(@Param("challengeId") Long challengeId);

    @Query("SELECT MAX(s.score) FROM Submission s WHERE s.challengeId = :challengeId")
    Integer getHighestScoreByChallengeId(@Param("challengeId") Long challengeId);

    @Query("SELECT MIN(s.score) FROM Submission s WHERE s.challengeId = :challengeId")
    Integer getLowestScoreByChallengeId(@Param("challengeId") Long challengeId);

    @Query("SELECT COALESCE(AVG(CAST(s.correctAnswers AS double) / NULLIF(s.totalQuestions, 0) * 100), 0.0) FROM Submission s WHERE s.challengeId = :challengeId")
    Double getAverageAccuracyByChallengeId(@Param("challengeId") Long challengeId);

    @Query("SELECT COALESCE(AVG(s.completionTime), 0) FROM Submission s WHERE s.challengeId = :challengeId AND s.completionTime IS NOT NULL")
    Double getAverageCompletionTimeByChallengeId(@Param("challengeId") Long challengeId);

    @Query("SELECT MIN(s.completionTime) FROM Submission s WHERE s.challengeId = :challengeId AND s.completionTime IS NOT NULL AND s.status = 'PASSED'")
    Long getFastestCompletionTimeByChallengeId(@Param("challengeId") Long challengeId);

    // ── Global stats ───────────────────────────────────────────────────────────
    @Query("SELECT COALESCE(AVG(s.score), 0.0) FROM Submission s")
    Double getGlobalAverageScore();

    @Query("SELECT COALESCE(AVG(CAST(s.correctAnswers AS double) / NULLIF(s.totalQuestions, 0) * 100), 0.0) FROM Submission s")
    Double getGlobalAverageAccuracy();

    @Query("SELECT COUNT(DISTINCT s.userId) FROM Submission s")
    Long countDistinctUsers();

    // ── Leaderboard ────────────────────────────────────────────────────────────
    @Query("SELECT s.userId, SUM(s.score) as totalScore, COUNT(s) as attempts " +
           "FROM Submission s WHERE s.status = 'PASSED' " +
           "GROUP BY s.userId ORDER BY totalScore DESC")
    List<Object[]> getLeaderboard();

    // ── Breakdown by level (via challenge join) ────────────────────────────────
    @Query("SELECT c.level, COUNT(s) FROM Submission s " +
           "JOIN Challenge c ON s.challengeId = c.id " +
           "GROUP BY c.level")
    List<Object[]> countSubmissionsByLevel();

    @Query("SELECT c.type, COUNT(s) FROM Submission s " +
           "JOIN Challenge c ON s.challengeId = c.id " +
           "GROUP BY c.type")
    List<Object[]> countSubmissionsByType();

    // ── User breakdown by level ────────────────────────────────────────────────
    @Query("SELECT c.level, COALESCE(SUM(s.score), 0) FROM Submission s " +
           "JOIN Challenge c ON s.challengeId = c.id " +
           "WHERE s.userId = :userId GROUP BY c.level")
    List<Object[]> getScoreByLevelForUser(@Param("userId") Long userId);

    @Query("SELECT c.level, COUNT(s) FROM Submission s " +
           "JOIN Challenge c ON s.challengeId = c.id " +
           "WHERE s.userId = :userId GROUP BY c.level")
    List<Object[]> getAttemptsByLevelForUser(@Param("userId") Long userId);

    @Query("SELECT c.type, COALESCE(SUM(s.score), 0) FROM Submission s " +
           "JOIN Challenge c ON s.challengeId = c.id " +
           "WHERE s.userId = :userId GROUP BY c.type")
    List<Object[]> getScoreByTypeForUser(@Param("userId") Long userId);

    @Query("SELECT c.type, COUNT(s) FROM Submission s " +
           "JOIN Challenge c ON s.challengeId = c.id " +
           "WHERE s.userId = :userId GROUP BY c.type")
    List<Object[]> getAttemptsByTypeForUser(@Param("userId") Long userId);

    // ── Hardest challenges (lowest pass rate with min attempts) ───────────────
    @Query("SELECT s.challengeId, " +
           "COUNT(s) as total, " +
           "SUM(CASE WHEN s.status = 'PASSED' THEN 1 ELSE 0 END) as passed " +
           "FROM Submission s GROUP BY s.challengeId HAVING COUNT(s) >= 3 " +
           "ORDER BY (SUM(CASE WHEN s.status = 'PASSED' THEN 1 ELSE 0 END) * 1.0 / COUNT(s)) ASC")
    List<Object[]> getHardestChallenges();
}
