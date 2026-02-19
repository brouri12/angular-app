package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.BadgeDTO;
import com.elearning.quizbadge.entity.Badge;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Badge operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {
    
    private final BadgeRepository badgeRepository;
    private final BadgeAttributionService badgeAttributionService;
    
    /**
     * Award badge to student.
     */
    @Transactional
    public BadgeDTO awardBadge(BadgeDTO badgeDTO) {
        log.info("Awarding badge {} to student {}", badgeDTO.getBadgeName(), badgeDTO.getStudentId());
        
        // Check if student already has this badge
        if (badgeRepository.existsByStudentIdAndBadgeType(badgeDTO.getStudentId(), badgeDTO.getBadgeType())) {
            log.info("Student {} already has badge type {}", badgeDTO.getStudentId(), badgeDTO.getBadgeType());
            throw new ResourceNotFoundException("Student already has this badge type");
        }
        
        Badge badge = badgeDTO.toEntity();
        Badge saved = badgeRepository.save(badge);
        
        log.info("Badge awarded with ID: {}", saved.getId());
        return BadgeDTO.fromEntity(saved);
    }
    
    /**
     * Get all badges for a student.
     */
    @Transactional(readOnly = true)
    public List<BadgeDTO> getBadgesByStudent(Long studentId) {
        return badgeRepository.findByStudentId(studentId).stream()
                .map(BadgeDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all badges.
     */
    @Transactional(readOnly = true)
    public List<BadgeDTO> getAllBadges() {
        return badgeRepository.findAll().stream()
                .map(BadgeDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get badge by ID.
     */
    @Transactional(readOnly = true)
    public BadgeDTO getBadgeById(Long id) {
        return badgeRepository.findById(id)
                .map(BadgeDTO::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found with ID: " + id));
    }
    
    /**
     * Delete badge.
     */
    @Transactional
    public void deleteBadge(Long id) {
        log.info("Deleting badge with ID: {}", id);
        
        if (!badgeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Badge not found with ID: " + id);
        }
        
        badgeRepository.deleteById(id);
        log.info("Badge deleted: {}", id);
    }
    
    /**
     * Get recent badges for a student.
     */
    @Transactional(readOnly = true)
    public List<BadgeDTO> getRecentBadges(Long studentId) {
        return badgeRepository.findTop10ByStudentIdOrderByEarnedDateDesc(studentId).stream()
                .map(BadgeDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get badge count for a student.
     */
    @Transactional(readOnly = true)
    public Long getBadgeCount(Long studentId) {
        return badgeRepository.countByStudentId(studentId);
    }
    
    /**
     * Check and award badges automatically based on student progress.
     */
    @Transactional
    public void checkAndAwardBadges(Long studentId) {
        badgeAttributionService.checkAndAwardBadges(studentId);
    }
}
