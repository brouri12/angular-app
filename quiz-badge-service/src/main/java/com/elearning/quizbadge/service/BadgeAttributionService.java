package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.BadgeDTO;
import com.elearning.quizbadge.entity.Badge;
import com.elearning.quizbadge.entity.CourseEnrollment;
import com.elearning.quizbadge.repository.BadgeRepository;
import com.elearning.quizbadge.repository.CourseEnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for automatic badge attribution based on student achievements.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeAttributionService {
    
    private final BadgeRepository badgeRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    
    /**
     * Check and award badges automatically based on student progress.
     */
    @Transactional
    public void checkAndAwardBadges(Long studentId) {
        log.info("Checking badge eligibility for student: {}", studentId);
        
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentId(studentId);
        
        for (CourseEnrollment enrollment : enrollments) {
            checkAndAwardCourseCompletionBadge(enrollment);
            checkAndAwardPerfectScoreBadge(enrollment);
            checkAndAwardSpeedBadge(enrollment);
            checkAndAwardStreakBadge(studentId);
        }
    }
    
    /**
     * Award course completion badge.
     */
    private void checkAndAwardCourseCompletionBadge(CourseEnrollment enrollment) {
        if (enrollment.getCompletionPercentage() != null && 
            enrollment.getCompletionPercentage().compareTo(BigDecimal.valueOf(100)) >= 0) {
            
            // Check if student already has this badge
            if (!badgeRepository.existsByStudentIdAndBadgeType(
                    enrollment.getStudentId(), 
                    Badge.BadgeType.COURSE_COMPLETION)) {
                
                BadgeDTO badgeDTO = new BadgeDTO();
badgeDTO.setStudentId(enrollment.getStudentId());
badgeDTO.setBadgeName("Cours Terminé");
badgeDTO.setBadgeType(Badge.BadgeType.COURSE_COMPLETION);
badgeDTO.setDescription("Félicitations ! Vous avez terminé le cours avec succès.");
badgeDTO.setIconUrl("/icons/course-completion.png");
badgeDTO.setCourseId(enrollment.getCourseId());
badgeDTO.setCriteriaMet("100% de progression");
badgeDTO.setBadgeLevel(Badge.BadgeLevel.BRONZE);
                
                Badge saved = badgeRepository.save(badgeDTO.toEntity());
                log.info("Awarded COURSE_COMPLETION badge to student {} for course {}", 
                        enrollment.getStudentId(), enrollment.getCourseId());
            }
        }
    }
    
    /**
     * Award perfect score badge.
     */
    private void checkAndAwardPerfectScoreBadge(CourseEnrollment enrollment) {
        if (enrollment.getFinalGrade() != null && 
            enrollment.getFinalGrade().compareTo(BigDecimal.valueOf(100)) == 0) {
            
            if (!badgeRepository.existsByStudentIdAndBadgeType(
                    enrollment.getStudentId(), 
                    Badge.BadgeType.PERFECT_SCORE)) {
                
                BadgeDTO badgeDTO = new BadgeDTO();
badgeDTO.setStudentId(enrollment.getStudentId());
badgeDTO.setBadgeName("Score Parfait");
badgeDTO.setBadgeType(Badge.BadgeType.PERFECT_SCORE);
badgeDTO.setDescription("Excellent ! Score parfait de 100/100.");
badgeDTO.setIconUrl("/icons/perfect-score.png");
badgeDTO.setCourseId(enrollment.getCourseId());
badgeDTO.setCriteriaMet("Note finale: 100/100");
badgeDTO.setBadgeLevel(Badge.BadgeLevel.GOLD);
                
                Badge saved = badgeRepository.save(badgeDTO.toEntity());
                log.info("Awarded PERFECT_SCORE badge to student {} for course {}", 
                        enrollment.getStudentId(), enrollment.getCourseId());
            }
        }
    }
    
    /**
     * Award speed badge for completing course quickly.
     */
    private void checkAndAwardSpeedBadge(CourseEnrollment enrollment) {
        if (enrollment.getEnrollmentDate() != null) {
            long daysToComplete = java.time.temporal.ChronoUnit.DAYS.between(
                    enrollment.getEnrollmentDate(), 
                    LocalDate.now());
            
            // Award speed badge if completed in less than 7 days
            if (enrollment.getCompletionPercentage() != null && 
                    enrollment.getCompletionPercentage().compareTo(BigDecimal.valueOf(100)) >= 0 && 
                    daysToComplete <= 7) {
                
                if (!badgeRepository.existsByStudentIdAndBadgeType(
                        enrollment.getStudentId(), 
                        Badge.BadgeType.SPEED_STAR)) {
                    
                    BadgeDTO badgeDTO = new BadgeDTO();
badgeDTO.setStudentId(enrollment.getStudentId());
badgeDTO.setBadgeName("Étoile de la Vitesse");
badgeDTO.setBadgeType(Badge.BadgeType.SPEED_STAR);
badgeDTO.setDescription("Cours terminé en moins de 7 jours ! Vitesse impressionnante.");
badgeDTO.setIconUrl("/icons/speed-star.png");
badgeDTO.setCourseId(enrollment.getCourseId());
badgeDTO.setCriteriaMet("Terminé en " + daysToComplete + " jours");
badgeDTO.setBadgeLevel(Badge.BadgeLevel.SILVER);
                    
                    Badge saved = badgeRepository.save(badgeDTO.toEntity());
                    log.info("Awarded SPEED_STAR badge to student {} for course {}", 
                            enrollment.getStudentId(), enrollment.getCourseId());
                }
            }
        }
    }
    
    /**
     * Award streak badge for multiple consecutive course completions.
     */
    private void checkAndAwardStreakBadge(Long studentId) {
        List<CourseEnrollment> completedCourses = courseEnrollmentRepository.findByStudentId(studentId).stream()
                .filter(e -> e.getCompletionPercentage() != null && e.getCompletionPercentage().compareTo(BigDecimal.valueOf(100)) >= 0)
                .collect(Collectors.toList());
        
        // Check for 3 consecutive completions
        if (completedCourses.size() >= 3) {
            if (!badgeRepository.existsByStudentIdAndBadgeType(studentId, Badge.BadgeType.STREAK)) {
                
                BadgeDTO badgeDTO = new BadgeDTO();
badgeDTO.setStudentId(studentId);
badgeDTO.setBadgeName("Série de Victoires");
badgeDTO.setBadgeType(Badge.BadgeType.STREAK);
badgeDTO.setDescription("3 cours terminés consécutivement ! Impressionnant.");
badgeDTO.setIconUrl("/icons/streak.png");
badgeDTO.setBadgeLevel(Badge.BadgeLevel.GOLD);
                
                Badge saved = badgeRepository.save(badgeDTO.toEntity());
                log.info("Awarded STREAK badge to student {}", studentId);
            }
        }
    }
    
    /**
     * Award top student badge for highest average score.
     */
    @Transactional
    public void checkAndAwardTopStudentBadge(Long studentId) {
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentId(studentId);
        
        if (enrollments.isEmpty()) {
            return;
        }
        
        // Calculate average score
        BigDecimal averageScore = enrollments.stream()
                .filter(e -> e.getFinalGrade() != null)
                .map(CourseEnrollment::getFinalGrade)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(enrollments.size()), RoundingMode.HALF_UP);
        
        // Award top student badge for average >= 90
        if (averageScore.compareTo(BigDecimal.valueOf(90)) >= 0) {
            if (!badgeRepository.existsByStudentIdAndBadgeType(studentId, Badge.BadgeType.TOP_STUDENT)) {
                
                BadgeDTO badgeDTO = new BadgeDTO();
badgeDTO.setStudentId(studentId);
badgeDTO.setBadgeName("Meilleur Étudiant");
badgeDTO.setBadgeType(Badge.BadgeType.TOP_STUDENT);
badgeDTO.setDescription("Moyenne de " + averageScore + "/100 ! Performance exceptionnelle.");
badgeDTO.setIconUrl("/icons/top-student.png");
badgeDTO.setBadgeLevel(Badge.BadgeLevel.DIAMOND);
                
                Badge saved = badgeRepository.save(badgeDTO.toEntity());
                log.info("Awarded TOP_STUDENT badge to student {} with average score {}", studentId, averageScore);
            }
        }
    }
    
    /**
     * Award first attempt badge.
     */
    @Transactional
    public void checkAndAwardFirstAttemptBadge(Long studentId) {
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentId(studentId);
        
        // Find first quiz attempt
        CourseEnrollment firstQuiz = enrollments.stream()
                .filter(e -> e.getCompletionPercentage() != null && e.getCompletionPercentage().compareTo(BigDecimal.ZERO) > 0)
                .findFirst()
                .orElse(null);
        
        if (firstQuiz != null && !badgeRepository.existsByStudentIdAndBadgeType(studentId, Badge.BadgeType.FIRST_ATTEMPT)) {
            
            BadgeDTO badgeDTO = new BadgeDTO();
badgeDTO.setStudentId(studentId);
badgeDTO.setBadgeName("Premier Pas");
badgeDTO.setBadgeType(Badge.BadgeType.FIRST_ATTEMPT);
badgeDTO.setDescription("Première tentative de quiz réussie !");
badgeDTO.setIconUrl("/icons/first-attempt.png");
badgeDTO.setCourseId(firstQuiz.getCourseId());
badgeDTO.setCriteriaMet("Premier quiz complété");
badgeDTO.setBadgeLevel(Badge.BadgeLevel.BRONZE);
            
            Badge saved = badgeRepository.save(badgeDTO.toEntity());
            log.info("Awarded FIRST_ATTEMPT badge to student {} for course {}", 
                    studentId, firstQuiz.getCourseId());
        }
    }
}
