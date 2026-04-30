package com.gestions.ramzi.servicepronunciation.repositories;

import com.gestions.ramzi.servicepronunciation.entities.UserRecording;
import com.gestions.ramzi.servicepronunciation.enums.RecordingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRecordingRepository extends JpaRepository<UserRecording, Long> {

    long countByUserIdAndChallengeId(Long userId, Long challengeId);

    // Find recordings by user ID
    List<UserRecording> findByUserId(Long userId);

    // Find recordings by user ID with pagination
    Page<UserRecording> findByUserId(Long userId, Pageable pageable);

    // Find recordings by challenge ID
    List<UserRecording> findByChallengeId(Long challengeId);

    // Find recordings by challenge ID with pagination
    Page<UserRecording> findByChallengeId(Long challengeId, Pageable pageable);


    // Find recordings by user ID and challenge ID
    List<UserRecording> findByUserIdAndChallengeId(Long userId, Long challengeId);

    // Find recordings by user ID and status
    List<UserRecording> findByUserIdAndStatus(Long userId, RecordingStatus status);

    // Find completed recordings by user
    @Query("SELECT r FROM UserRecording r WHERE r.userId = :userId AND r.status = 'COMPLETED'")
    List<UserRecording> findCompletedByUserId(Long userId);

    // Find best score for a challenge by user
    @Query("SELECT r FROM UserRecording r WHERE r.userId = :userId AND r.challenge.id = :challengeId " +
           "AND r.status = 'COMPLETED' ORDER BY r.overallScore DESC")
    Optional<UserRecording> findBestRecording(Long userId, Long challengeId);

    // Get user's best recordings
    @Query("SELECT r FROM UserRecording r WHERE r.userId = :userId AND r.status = 'COMPLETED' " +
           "ORDER BY r.overallScore DESC")
    List<UserRecording> findUserBestRecordings(Long userId, Pageable pageable);

    // Count recordings by user
    Long countByUserId(Long userId);

    // Count completed recordings by user
    @Query("SELECT COUNT(r) FROM UserRecording r WHERE r.userId = :userId AND r.status = 'COMPLETED'")
    Long countCompletedByUserId(Long userId);

    // Get average score for user
    @Query("SELECT AVG(r.overallScore) FROM UserRecording r WHERE r.userId = :userId AND r.status = 'COMPLETED'")
    Double getAverageScoreByUserId(Long userId);

    // Get average score by challenge
    @Query("SELECT AVG(r.overallScore) FROM UserRecording r WHERE r.challenge.id = :challengeId AND r.status = 'COMPLETED'")
    Double getAverageScoreByChallengeId(Long challengeId);

    // Get user's latest recording for a challenge
    @Query("SELECT r FROM UserRecording r WHERE r.userId = :userId AND r.challenge.id = :challengeId " +
           "ORDER BY r.submittedAt DESC")
    Optional<UserRecording> findLatestByUserAndChallenge(Long userId, Long challengeId);

    @Query("SELECT r FROM UserRecording r WHERE r.userId = :userId AND r.status = 'COMPLETED' " +
           "AND r.overallScore >= :minScore AND r.overallScore < :maxScore")
    Page<UserRecording> findByUserIdAndScoreRange(Long userId, double minScore, double maxScore, Pageable pageable);
}

