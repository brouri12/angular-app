package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Badge entity operations.
 */
@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    
    /**
     * Find badges by student ID.
     */
    List<Badge> findByStudentId(Long studentId);
    
    /**
     * Find badges by student ID and badge type.
     */
    List<Badge> findByStudentIdAndBadgeType(Long studentId, Badge.BadgeType badgeType);
    
    /**
     * Find badges by course ID.
     */
    List<Badge> findByCourseId(Long courseId);
    
    /**
     * Check if student has earned a specific badge type.
     */
    boolean existsByStudentIdAndBadgeType(Long studentId, Badge.BadgeType badgeType);
    
    /**
     * Find badge by student and badge name.
     */
    Optional<Badge> findByStudentIdAndBadgeName(Long studentId, String badgeName);
    
    /**
     * Count badges by student.
     */
    Long countByStudentId(Long studentId);
    
    /**
     * Find recent badges for a student.
     */
    List<Badge> findTop10ByStudentIdOrderByEarnedDateDesc(Long studentId);
}
