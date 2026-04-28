package com.gestions.ramzi.servicepronunciation.repositories;

import com.gestions.ramzi.servicepronunciation.entities.UserProgress;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    // Find progress by user ID
    Optional<UserProgress> findByUserId(Long userId);

    // Get or create progress for user
    default UserProgress getOrCreateUserProgress(Long userId) {
        return findByUserId(userId).orElseGet(() -> {
            UserProgress progress = UserProgress.builder()
                    .userId(userId)
                    .build();
            return save(progress);
        });
    }

    // Find users by estimated level
    List<UserProgress> findByEstimatedLevel(NiveauCECRL level);

    // Get top users by global average score
    @Query("SELECT p FROM UserProgress p WHERE p.globalAverageScore > 0 " +
           "ORDER BY p.globalAverageScore DESC")
    List<UserProgress> findTopUsersByScore(org.springframework.data.domain.Pageable pageable);

    // Get users with best streaks
    @Query("SELECT p FROM UserProgress p WHERE p.bestStreak > 0 " +
           "ORDER BY p.bestStreak DESC")
    List<UserProgress> findTopUsersByStreak(org.springframework.data.domain.Pageable pageable);

    // Count users with streaks
    Long countByCurrentStreakGreaterThan(Integer streak);
}

