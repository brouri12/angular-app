package com.elearning.formation.service;

import com.elearning.formation.dto.*;
import com.elearning.formation.entity.Course;
import com.elearning.formation.entity.CourseEnrollment;
import com.elearning.formation.exception.ResourceNotFoundException;
import com.elearning.formation.exception.BadRequestException;
import com.elearning.formation.repository.CourseRepository;
import com.elearning.formation.repository.CourseEnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for CourseEnrollment operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EnrollmentService {
    
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseRepository courseRepository;
    
    // ==================== CRUD OPERATIONS ====================
    
    /**
     * Create a new enrollment.
     */
    @Transactional
    public EnrollmentDTO createEnrollment(EnrollmentDTO enrollmentDTO) {
        log.info("Creating enrollment for student: {} in course: {}", 
                enrollmentDTO.getStudentId(), enrollmentDTO.getCourseId());
        
        // Check if course exists
        Course course = courseRepository.findById(enrollmentDTO.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Course not found with ID: " + enrollmentDTO.getCourseId()));
        
        // Check if already enrolled
        if (courseEnrollmentRepository.existsByCourseIdAndStudentId(
                enrollmentDTO.getCourseId(), enrollmentDTO.getStudentId())) {
            throw new BadRequestException("Student is already enrolled in this course");
        }
        
        // Check if course is full
        if (course.getMaxStudents() != null) {
            long currentEnrollments = courseEnrollmentRepository
                    .countActiveEnrollmentsByCourseId(enrollmentDTO.getCourseId());
            if (currentEnrollments >= course.getMaxStudents()) {
                throw new BadRequestException("Course is full. Maximum students reached.");
            }
        }
        
        // Check if course is published
        if (course.getStatus() != Course.CourseStatus.PUBLISHED) {
            throw new BadRequestException("Cannot enroll in a course that is not published");
        }
        
        CourseEnrollment enrollment = enrollmentDTO.toEntity();
        enrollment.setStatus(CourseEnrollment.EnrollmentStatus.ACTIVE);
        enrollment.setCompletionPercentage(BigDecimal.ZERO);
        
        CourseEnrollment savedEnrollment = courseEnrollmentRepository.save(enrollment);
        log.info("Enrollment created successfully with ID: {}", savedEnrollment.getId());
        
        return enrichEnrollmentDTO(EnrollmentDTO.fromEntity(savedEnrollment));
    }
    
    /**
     * Get enrollment by ID.
     */
    @Transactional(readOnly = true)
    public EnrollmentDTO getEnrollmentById(Long id) {
        log.debug("Fetching enrollment by ID: {}", id);
        
        CourseEnrollment enrollment = courseEnrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with ID: " + id));
        
        return enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment));
    }
    
    /**
     * Get all enrollments with pagination.
     */
    @Transactional(readOnly = true)
    public Page<EnrollmentDTO> getAllEnrollments(int page, int size) {
        log.debug("Fetching all enrollments - page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CourseEnrollment> enrollments = courseEnrollmentRepository.findAll(pageable);
        
        return enrollments.map(enrollment -> enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment)));
    }
    
    /**
     * Get enrollments by student ID.
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByStudent(Long studentId) {
        log.debug("Fetching enrollments for student: {}", studentId);
        
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentId(studentId);
        
        return enrollments.stream()
                .map(enrollment -> enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment)))
                .collect(Collectors.toList());
    }
    
    /**
     * Get enrollments by course ID.
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getEnrollmentsByCourse(Long courseId) {
        log.debug("Fetching enrollments for course: {}", courseId);
        
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByCourseId(courseId);
        
        return enrollments.stream()
                .map(enrollment -> enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment)))
                .collect(Collectors.toList());
    }
    
    /**
     * Update enrollment.
     */
    @Transactional
    public EnrollmentDTO updateEnrollment(Long id, EnrollmentDTO enrollmentDTO) {
        log.info("Updating enrollment with ID: {}", id);
        
        CourseEnrollment existingEnrollment = courseEnrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with ID: " + id));
        
        existingEnrollment.setCompletionPercentage(enrollmentDTO.getCompletionPercentage());
        existingEnrollment.setStatus(enrollmentDTO.getStatus());
        existingEnrollment.setFinalGrade(enrollmentDTO.getFinalGrade());
        
        CourseEnrollment updatedEnrollment = courseEnrollmentRepository.save(existingEnrollment);
        log.info("Enrollment updated successfully: {}", updatedEnrollment.getId());
        
        return enrichEnrollmentDTO(EnrollmentDTO.fromEntity(updatedEnrollment));
    }
    
    /**
     * Delete enrollment.
     */
    @Transactional
    public void deleteEnrollment(Long id) {
        log.info("Deleting enrollment with ID: {}", id);
        
        if (!courseEnrollmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Enrollment not found with ID: " + id);
        }
        
        courseEnrollmentRepository.deleteById(id);
        log.info("Enrollment deleted successfully: {}", id);
    }
    
    // ==================== ADVANCED METHODS ====================
    
    /**
     * Automatically calculate progress based on quiz completions and lessons viewed.
     * This would integrate with the quiz-badge-service for actual progress tracking.
     */
    @Transactional
    public EnrollmentDTO calculateProgressAutomatically(Long enrollmentId) {
        log.info("Calculating automatic progress for enrollment: {}", enrollmentId);
        
        CourseEnrollment enrollment = courseEnrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with ID: " + enrollmentId));
        
        Course course = courseRepository.findById(enrollment.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        // Calculate progress based on enrollment duration and expected completion time
        if (enrollment.getEnrollmentDate() != null && course.getDurationHours() != null) {
            long daysSinceEnrollment = ChronoUnit.DAYS.between(
                    enrollment.getEnrollmentDate(), LocalDate.now());
            
            // Expected progress: assume course should be completed in 30 days per 10 hours
            int expectedDurationDays = course.getDurationHours() * 3; // 3 days per hour
            BigDecimal expectedProgress = BigDecimal.valueOf(daysSinceEnrollment * 100.0 / expectedDurationDays)
                    .setScale(2, RoundingMode.HALF_UP);
            
            // Cap at 100%
            if (expectedProgress.compareTo(BigDecimal.valueOf(100)) > 0) {
                expectedProgress = BigDecimal.valueOf(100);
            }
            
            enrollment.setCompletionPercentage(expectedProgress);
            
            // Update status if completed
            if (expectedProgress.compareTo(BigDecimal.valueOf(100)) >= 0) {
                enrollment.setStatus(CourseEnrollment.EnrollmentStatus.COMPLETED);
            } else if (expectedProgress.compareTo(BigDecimal.ZERO) > 0) {
                enrollment.setStatus(CourseEnrollment.EnrollmentStatus.IN_PROGRESS);
            }
            
            CourseEnrollment updatedEnrollment = courseEnrollmentRepository.save(enrollment);
            log.info("Progress calculated for enrollment {}: {}%", enrollmentId, expectedProgress);
            
            return enrichEnrollmentDTO(EnrollmentDTO.fromEntity(updatedEnrollment));
        }
        
        return enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment));
    }
    
    /**
     * Predict dropout risk based on enrollment patterns and progress.
     * Uses a simplified algorithm based on multiple risk factors.
     */
    @Transactional(readOnly = true)
    public BigDecimal predictDropoutRisk(Long enrollmentId) {
        log.info("Predicting dropout risk for enrollment: {}", enrollmentId);
        
        CourseEnrollment enrollment = courseEnrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with ID: " + enrollmentId));
        
        Course course = courseRepository.findById(enrollment.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        double riskScore = 0.0;
        List<String> riskFactors = new ArrayList<>();
        
        // Factor 1: Low progress after significant time
        if (enrollment.getEnrollmentDate() != null) {
            long daysSinceEnrollment = ChronoUnit.DAYS.between(
                    enrollment.getEnrollmentDate(), LocalDate.now());
            
            BigDecimal progress = enrollment.getCompletionPercentage() != null 
                    ? enrollment.getCompletionPercentage() 
                    : BigDecimal.ZERO;
            
            double expectedProgress = (double) daysSinceEnrollment / (course.getDurationHours() * 3) * 100;
            expectedProgress = Math.min(expectedProgress, 100);
            
            if (progress.doubleValue() < expectedProgress * 0.5) {
                riskScore += 30;
                riskFactors.add("Progress significantly behind schedule");
            }
            
            // Factor 2: No activity in over 14 days
            if (daysSinceEnrollment > 14 && progress.doubleValue() < 10) {
                riskScore += 40;
                riskFactors.add("No significant activity in 14+ days");
            }
        }
        
        // Factor 3: Very low initial progress
        if (enrollment.getCompletionPercentage() != null 
                && enrollment.getCompletionPercentage().doubleValue() < 5) {
            riskScore += 20;
            riskFactors.add("Very low initial engagement");
        }
        
        // Factor 4: Previously dropped courses
        long previousDrops = courseEnrollmentRepository.findByStudentId(enrollment.getStudentId())
                .stream()
                .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.DROPPED)
                .count();
        
        if (previousDrops >= 2) {
            riskScore += 20;
            riskFactors.add("History of dropped courses");
        }
        
        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);
        
        BigDecimal riskPercentage = BigDecimal.valueOf(riskScore)
                .setScale(2, RoundingMode.HALF_UP);
        
        log.info("Dropout risk for enrollment {}: {}%. Factors: {}", 
                enrollmentId, riskPercentage, riskFactors);
        
        return riskPercentage;
    }
    
    /**
     * Detect abnormal progress patterns that may indicate cheating.
     */
    @Transactional(readOnly = true)
    public List<EnrollmentDTO> detectAbnormalProgress(Long courseId) {
        log.info("Detecting abnormal progress patterns for course: {}", courseId);
        
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByCourseId(courseId);
        List<EnrollmentDTO> abnormalEnrollments = new ArrayList<>();
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        for (CourseEnrollment enrollment : enrollments) {
            if (enrollment.getEnrollmentDate() == null || enrollment.getCompletionPercentage() == null) {
                continue;
            }
            
            long daysEnrolled = ChronoUnit.DAYS.between(enrollment.getEnrollmentDate(), LocalDate.now());
            BigDecimal progress = enrollment.getCompletionPercentage();
            
            // Anomaly 1: Completion > 100%
            if (progress.compareTo(BigDecimal.valueOf(100)) > 0) {
                log.warn("Anomaly detected: Enrollment {} has progress > 100%: {}", 
                        enrollment.getId(), progress);
                EnrollmentDTO dto = enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment));
                dto.setHasAbnormalProgress(true);
                abnormalEnrollments.add(dto);
                continue;
            }
            
            // Anomaly 2: Completed in impossibly short time
            if (progress.compareTo(BigDecimal.valueOf(100)) >= 0 && daysEnrolled < 1) {
                log.warn("Anomaly detected: Enrollment {} completed in {} days", 
                        enrollment.getId(), daysEnrolled);
                EnrollmentDTO dto = enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment));
                dto.setHasAbnormalProgress(true);
                abnormalEnrollments.add(dto);
                continue;
            }
            
            // Anomaly 3: Progress rate far exceeds normal (e.g., > 50% per day)
            if (daysEnrolled > 0) {
                double dailyProgress = progress.doubleValue() / daysEnrolled;
                if (dailyProgress > 50) {
                    log.warn("Anomaly detected: Enrollment {} has abnormally high daily progress: {}%", 
                            enrollment.getId(), dailyProgress);
                    EnrollmentDTO dto = enrichEnrollmentDTO(EnrollmentDTO.fromEntity(enrollment));
                    dto.setHasAbnormalProgress(true);
                    abnormalEnrollments.add(dto);
                }
            }
        }
        
        log.info("Found {} enrollments with abnormal patterns in course: {}", 
                abnormalEnrollments.size(), courseId);
        
        return abnormalEnrollments;
    }
    
    /**
     * Generate comprehensive student report.
     */
    @Transactional(readOnly = true)
    public StudentReport generateStudentReport(Long studentId) {
        log.info("Generating student report for student: {}", studentId);
        
        List<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentId(studentId);
        
        if (enrollments.isEmpty()) {
            return StudentReport.builder()
                    .studentId(studentId)
                    .totalEnrollments(0)
                    .build();
        }
        
        // Calculate basic statistics
        int totalEnrollments = enrollments.size();
        int completedCourses = (int) enrollments.stream()
                .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.COMPLETED)
                .count();
        int droppedCourses = (int) enrollments.stream()
                .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.DROPPED)
                .count();
        int inProgressCourses = (int) enrollments.stream()
                .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.ACTIVE ||
                            e.getStatus() == CourseEnrollment.EnrollmentStatus.IN_PROGRESS)
                .count();
        
        // Grade statistics
        List<BigDecimal> grades = enrollments.stream()
                .map(CourseEnrollment::getFinalGrade)
                .filter(g -> g != null)
                .collect(Collectors.toList());
        
        BigDecimal overallAverageGrade = grades.isEmpty() ? BigDecimal.ZERO
                : grades.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                  .divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
        
        BigDecimal highestGrade = grades.isEmpty() ? BigDecimal.ZERO
                : grades.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        
        BigDecimal lowestGrade = grades.isEmpty() ? BigDecimal.ZERO
                : grades.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        
        // Completion statistics
        List<BigDecimal> completions = enrollments.stream()
                .map(CourseEnrollment::getCompletionPercentage)
                .filter(c -> c != null)
                .collect(Collectors.toList());
        
        BigDecimal overallCompletionRate = completions.isEmpty() ? BigDecimal.ZERO
                : completions.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                  .divide(BigDecimal.valueOf(completions.size()), 2, RoundingMode.HALF_UP);
        
        // Build course details
        List<StudentReport.EnrollmentDetail> courseDetails = new ArrayList<>();
        for (CourseEnrollment enrollment : enrollments) {
            Course course = courseRepository.findById(enrollment.getCourseId()).orElse(null);
            
            BigDecimal dropoutRisk = predictDropoutRisk(enrollment.getId());
            List<EnrollmentDTO> abnormalList = detectAbnormalProgress(enrollment.getCourseId());
            boolean hasAbnormal = abnormalList.stream()
                    .anyMatch(a -> a.getId().equals(enrollment.getId()));
            
            StudentReport.EnrollmentDetail detail = StudentReport.EnrollmentDetail.builder()
                    .enrollmentId(enrollment.getId())
                    .courseTitle(course != null ? course.getTitle() : "Unknown")
                    .courseCode(course != null ? course.getCourseCode() : "Unknown")
                    .enrollmentDate(enrollment.getEnrollmentDate())
                    .completionPercentage(enrollment.getCompletionPercentage())
                    .finalGrade(enrollment.getFinalGrade())
                    .status(enrollment.getStatus().name())
                    .durationHours(course != null ? course.getDurationHours() : null)
                    .hasAbnormalProgress(hasAbnormal)
                    .atRiskOfDropout(dropoutRisk.compareTo(BigDecimal.valueOf(50)) > 0)
                    .build();
            
            courseDetails.add(detail);
        }
        
        // Generate predictions and recommendations
        BigDecimal predictedDropoutRisk = BigDecimal.ZERO;
        if (!enrollments.isEmpty()) {
            List<BigDecimal> risks = enrollments.stream()
                    .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.ACTIVE)
                    .map(e -> predictDropoutRisk(e.getId()))
                    .collect(Collectors.toList());
            
            if (!risks.isEmpty()) {
                predictedDropoutRisk = risks.stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(risks.size()), 2, RoundingMode.HALF_UP);
            }
        }
        
        List<String> recommendations = new ArrayList<>();
        if (predictedDropoutRisk.compareTo(BigDecimal.valueOf(50)) > 0) {
            recommendations.add("Consider reaching out to student for additional support");
        }
        if (droppedCourses > totalEnrollments / 2) {
            recommendations.add("Student has high dropout rate - recommend counseling");
        }
        if (completedCourses > 0 && overallAverageGrade.compareTo(BigDecimal.valueOf(80)) > 0) {
            recommendations.add("Eligible for advanced courses - recommend progression");
        }
        
        List<String> riskFactors = new ArrayList<>();
        if (droppedCourses > 2) {
            riskFactors.add("History of dropping courses");
        }
        if (predictedDropoutRisk.compareTo(BigDecimal.valueOf(50)) > 0) {
            riskFactors.add("Current enrollment at high risk");
        }
        
        return StudentReport.builder()
                .studentId(studentId)
                .reportGeneratedDate(LocalDate.now())
                .totalEnrollments(totalEnrollments)
                .completedCourses(completedCourses)
                .droppedCourses(droppedCourses)
                .inProgressCourses(inProgressCourses)
                .overallAverageGrade(overallAverageGrade)
                .highestGrade(highestGrade)
                .lowestGrade(lowestGrade)
                .overallCompletionRate(overallCompletionRate)
                .predictedDropoutRisk(predictedDropoutRisk)
                .courseDetails(courseDetails)
                .recommendations(recommendations)
                .riskFactors(riskFactors)
                .build();
    }
    
    // ==================== HELPER METHODS ====================
    
    private EnrollmentDTO enrichEnrollmentDTO(EnrollmentDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId()).orElse(null);
        if (course != null) {
            dto.setCourseTitle(course.getTitle());
            dto.setCourseCode(course.getCourseCode());
        }
        
        if (dto.getEnrollmentDate() != null) {
            long daysSinceEnrollment = ChronoUnit.DAYS.between(
                    dto.getEnrollmentDate(), LocalDate.now());
            dto.setDaysSinceEnrollment((int) daysSinceEnrollment);
        }
        
        // Add dropout risk prediction for active enrollments
        if (dto.getStatus() == CourseEnrollment.EnrollmentStatus.ACTIVE ||
            dto.getStatus() == CourseEnrollment.EnrollmentStatus.IN_PROGRESS) {
            dto.setPredictedDropoutRisk(predictDropoutRisk(dto.getId()));
        }
        
        return dto;
    }
}
