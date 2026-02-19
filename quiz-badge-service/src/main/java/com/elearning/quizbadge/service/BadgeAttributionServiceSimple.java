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
                
                BadgeDTO badgeDTO = BadgeDTO.builder()
                        .studentId(enrollment.getStudentId())
                        .badgeName("Cours Terminé")
                        .badgeType(Badge.BadgeType.COURSE_COMPLETION)
                        .description("Félicitations ! Vous avez terminé le cours avec succès.")
                        .iconUrl("/icons/course-completion.png")
                        .courseId(enrollment.getCourseId())
                        .criteriaMet("100% de progression")
                        .badgeLevel(Badge.BadgeLevel.BRONZE)
                        .build();
                
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
                
                BadgeDTO badgeDTO = BadgeDTO.builder()
                        .studentId(enrollment.getStudentId())
                        .badgeName("Score Parfait")
                        .badgeType(Badge.BadgeType.PERFECT_SCORE)
                        .description("Excellent ! Score parfait de 100/100.")
                        .iconUrl("/icons/perfect-score.png")
                        .courseId(enrollment.getCourseId())
                        .criteriaMet("Note finale: 100/100")
                        .badgeLevel(Badge.BadgeLevel.GOLD)
                        .build();
                
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
                    
                    BadgeDTO badgeDTO = BadgeDTO.builder()
                            .studentId(enrollment.getStudentId())
                            .badgeName("Étoile de la Vitesse")
                            .badgeType(Badge.BadgeType.SPEED_STAR)
                            .description("Cours terminé en moins de 7 jours ! Vitesse impressionnante.")
                            .iconUrl("/icons/speed-star.png")
                            .courseId(enrollment.getCourseId())
                            .criteriaMet("Terminé en " + daysToComplete + " jours")
                            .badgeLevel(Badge.BadgeLevel.SILVER)
                            .build();
                    
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
                
                BadgeDTO badgeDTO = BadgeDTO.builder()
                        .studentId(studentId)
                        .badgeName("Série de Victoires")
                        .badgeType(Badge.BadgeType.STREAK)
                        .description("3 cours terminés consécutivement ! Impressionnant.")
                        .iconUrl("/icons/streak.png")
                        .badgeLevel(Badge.BadgeLevel.GOLD)
                        .build();
                
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
                
                BadgeDTO badgeDTO = BadgeDTO.builder()
                        .studentId(studentId)
                        .badgeName("Meilleur Étudiant")
                        .badgeType(Badge.BadgeType.TOP_STUDENT)
                        .description("Moyenne de " + averageScore + "/100 ! Performance exceptionnelle.")
                        .iconUrl("/icons/top-student.png")
                        .badgeLevel(Badge.BadgeLevel.DIAMOND)
                        .build();
                
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
            
            BadgeDTO badgeDTO = BadgeDTO.builder()
                    .studentId(studentId)
                    .badgeName("Premier Pas")
                    .badgeType(Badge.BadgeType.FIRST_ATTEMPT)
                    .description("Première tentative de quiz réussie !")
                    .iconUrl("/icons/first-attempt.png")
                    .courseId(firstQuiz.getCourseId())
                    .criteriaMet("Premier quiz complété")
                    .badgeLevel(Badge.BadgeLevel.BRONZE)
                    .build();
            
            Badge saved = badgeRepository.save(badgeDTO.toEntity());
            log.info("Awarded FIRST_ATTEMPT badge to student {} for course {}", 
                    studentId, firstQuiz.getCourseId());
        }
    }
}
