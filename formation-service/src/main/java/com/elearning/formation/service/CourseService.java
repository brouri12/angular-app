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
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Course operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    
    // ==================== CRUD OPERATIONS ====================
    
    /**
     * Create a new course.
     */
    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
        log.info("Creating new course with code: {}", courseDTO.getCourseCode());
        
        if (courseRepository.existsByCourseCode(courseDTO.getCourseCode())) {
            throw new BadRequestException("Course code already exists: " + courseDTO.getCourseCode());
        }
        
        Course course = courseDTO.toEntity();
        if (course.getStatus() == null) {
            course.setStatus(Course.CourseStatus.DRAFT);
        }
        if (course.getLevel() == null) {
            course.setLevel(Course.CourseLevel.BEGINNER);
        }
        
        Course savedCourse = courseRepository.save(course);
        log.info("Course created successfully with ID: {}", savedCourse.getId());
        
        return CourseDTO.fromEntity(savedCourse);
    }
    
    /**
     * Get course by ID.
     */
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(Long id) {
        log.debug("Fetching course by ID: {}", id);
        
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + id));
        
        return enrichCourseDTO(CourseDTO.fromEntity(course));
    }
    
    /**
     * Get course by course code.
     */
    @Transactional(readOnly = true)
    public CourseDTO getCourseByCode(String courseCode) {
        log.debug("Fetching course by code: {}", courseCode);
        
        Course course = courseRepository.findByCourseCode(courseCode)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with code: " + courseCode));
        
        return enrichCourseDTO(CourseDTO.fromEntity(course));
    }
    
    /**
     * Get all courses with pagination.
     */
    @Transactional(readOnly = true)
    public Page<CourseDTO> getAllCourses(int page, int size, String sortBy, String direction) {
        log.debug("Fetching all courses - page: {}, size: {}", page, size);
        
        Sort sort = direction.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Course> courses = courseRepository.findAll(pageable);
        
        return courses.map(course -> enrichCourseDTO(CourseDTO.fromEntity(course)));
    }
    
    /**
     * Update course.
     */
    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        log.info("Updating course with ID: {}", id);
        
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + id));
        
        if (!existingCourse.getCourseCode().equals(courseDTO.getCourseCode()) 
                && courseRepository.existsByCourseCode(courseDTO.getCourseCode())) {
            throw new BadRequestException("Course code already exists: " + courseDTO.getCourseCode());
        }
        
        existingCourse.setCourseCode(courseDTO.getCourseCode());
        existingCourse.setTitle(courseDTO.getTitle());
        existingCourse.setDescription(courseDTO.getDescription());
        existingCourse.setTeacherId(courseDTO.getTeacherId());
        existingCourse.setDurationHours(courseDTO.getDurationHours());
        existingCourse.setPrice(courseDTO.getPrice());
        existingCourse.setMaxStudents(courseDTO.getMaxStudents());
        existingCourse.setLevel(courseDTO.getLevel());
        existingCourse.setStatus(courseDTO.getStatus());
        
        Course updatedCourse = courseRepository.save(existingCourse);
        log.info("Course updated successfully: {}", updatedCourse.getId());
        
        return CourseDTO.fromEntity(updatedCourse);
    }
    
    /**
     * Delete course.
     */
    @Transactional
    public void deleteCourse(Long id) {
        log.info("Deleting course with ID: {}", id);
        
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with ID: " + id);
        }
        
        courseRepository.deleteById(id);
        log.info("Course deleted successfully: {}", id);
    }
    
    // ==================== ADVANCED SEARCH ====================
    
    /**
     * Advanced multi-criteria course search.
     */
    @Transactional(readOnly = true)
    public Page<CourseDTO> searchCoursesAdvanced(CourseSearchCriteria criteria) {
        log.info("Performing advanced course search with criteria: {}", criteria);
        
        Sort sort = criteria.getSortDirection().equalsIgnoreCase("ASC")
                ? Sort.by(criteria.getSortBy()).ascending()
                : Sort.by(criteria.getSortBy()).descending();
        
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);
        
        Specification<Course> spec = Specification.where(hasKeyword(criteria.getKeyword()))
                .and(hasLevel(criteria.getLevel()))
                .and(hasStatus(criteria.getStatus()))
                .and(hasPriceRange(criteria.getMinPrice(), criteria.getMaxPrice()))
                .and(hasDurationRange(criteria.getMinDurationHours(), criteria.getMaxDurationHours()))
                .and(hasTeacherId(criteria.getTeacherId()));
        
        Page<Course> courses = courseRepository.findAll(spec, pageable);
        
        return courses.map(course -> enrichCourseDTO(CourseDTO.fromEntity(course)));
    }
    
    /**
     * Get AI-recommended courses based on student profile and behavior.
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> getRecommendedCourses(Long studentId, int limit) {
        log.info("Generating course recommendations for student: {}", studentId);
        
        // Get student's completed courses to understand preferences
        List<CourseEnrollment> completedEnrollments = enrollmentRepository
                .findByStudentIdAndStatus(studentId, CourseEnrollment.EnrollmentStatus.COMPLETED);
        
        // Get student's active enrollments
        List<CourseEnrollment> activeEnrollments = enrollmentRepository
                .findByStudentIdAndStatus(studentId, CourseEnrollment.EnrollmentStatus.ACTIVE);
        
        // Find courses at similar or higher level based on completed courses
        // This is a simplified recommendation algorithm
        List<Course> recommendedCourses;
        
        if (completedEnrollments.isEmpty()) {
            // New student - recommend beginner courses
            recommendedCourses = courseRepository
                    .findByStatus(Course.CourseStatus.PUBLISHED, PageRequest.of(0, limit))
                    .getContent();
        } else {
            // Get courses based on student's level preference
            Course.CourseLevel targetLevel = completedEnrollments.stream()
                    .map(e -> courseRepository.findById(e.getCourseId()).orElse(null))
                    .filter(c -> c != null)
                    .map(Course::getLevel)
                    .max((a, b) -> a.ordinal() - b.ordinal())
                    .orElse(Course.CourseLevel.BEGINNER);
            
            recommendedCourses = courseRepository
                    .findByLevel(targetLevel, PageRequest.of(0, limit))
                    .getContent();
            
            // Exclude already enrolled courses
            List<Long> enrolledCourseIds = activeEnrollments.stream()
                    .map(CourseEnrollment::getCourseId)
                    .collect(Collectors.toList());
            
            recommendedCourses = recommendedCourses.stream()
                    .filter(c -> !enrolledCourseIds.contains(c.getId()))
                    .filter(c -> c.getStatus() == Course.CourseStatus.PUBLISHED)
                    .limit(limit)
                    .collect(Collectors.toList());
        }
        
        log.info("Found {} recommended courses for student: {}", recommendedCourses.size(), studentId);
        
        return recommendedCourses.stream()
                .map(course -> enrichCourseDTO(CourseDTO.fromEntity(course)))
                .collect(Collectors.toList());
    }
    
    // ==================== STATISTICS ====================
    
    /**
     * Get comprehensive course statistics.
     */
    @Transactional(readOnly = true)
    public CourseStatistics getCourseStatistics(Long courseId) {
        log.info("Generating statistics for course: {}", courseId);
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        
        List<CourseEnrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        
        if (enrollments.isEmpty()) {
            return CourseStatistics.builder()
                    .courseId(courseId)
                    .courseTitle(course.getTitle())
                    .totalEnrollments(0L)
                    .build();
        }
        
        // Calculate statistics
        long totalEnrollments = enrollments.size();
        long activeEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.ACTIVE || 
                            e.getStatus() == CourseEnrollment.EnrollmentStatus.IN_PROGRESS)
                .count();
        long completedEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.COMPLETED)
                .count();
        long droppedEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == CourseEnrollment.EnrollmentStatus.DROPPED)
                .count();
        
        // Completion percentage stats
        List<BigDecimal> completionPercentages = enrollments.stream()
                .map(CourseEnrollment::getCompletionPercentage)
                .filter(p -> p != null)
                .sorted()
                .collect(Collectors.toList());
        
        BigDecimal avgCompletion = calculateAverage(completionPercentages);
        BigDecimal medianCompletion = calculateMedian(completionPercentages);
        
        // Grade stats
        List<BigDecimal> grades = enrollments.stream()
                .map(CourseEnrollment::getFinalGrade)
                .filter(g -> g != null)
                .sorted()
                .collect(Collectors.toList());
        
        BigDecimal avgGrade = calculateAverage(grades);
        BigDecimal medianGrade = calculateMedian(grades);
        BigDecimal passRate = grades.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf(grades.stream().filter(g -> g.compareTo(new BigDecimal("60")) >= 0).count())
                  .divide(BigDecimal.valueOf(grades.size()), 4, RoundingMode.HALF_UP)
                  .multiply(new BigDecimal("100"));
        
        // Available slots
        Long availableSlots = course.getMaxStudents() != null 
                ? (long) (course.getMaxStudents() - totalEnrollments) 
                : null;
        Double occupancyRate = course.getMaxStudents() != null && course.getMaxStudents() > 0
                ? (double) totalEnrollments / course.getMaxStudents() * 100
                : null;
        
        // Revenue
        BigDecimal totalRevenue = course.getPrice() != null
                ? course.getPrice().multiply(BigDecimal.valueOf(completedEnrollments))
                : BigDecimal.ZERO;
        
        return CourseStatistics.builder()
                .courseId(courseId)
                .courseTitle(course.getTitle())
                .totalEnrollments(totalEnrollments)
                .activeEnrollments(activeEnrollments)
                .completedEnrollments(completedEnrollments)
                .droppedEnrollments(droppedEnrollments)
                .averageCompletionPercentage(avgCompletion)
                .medianCompletionPercentage(medianCompletion)
                .averageGrade(avgGrade)
                .medianGrade(medianGrade)
                .passRate(passRate)
                .totalRevenue(totalRevenue)
                .availableSlots(availableSlots)
                .occupancyRate(occupancyRate)
                .build();
    }
    
    // ==================== AUTO ARCHIVE ====================
    
    /**
     * Automatically archive old courses that haven't been updated in specified days.
     */
    @Transactional
    public int autoArchiveOldCourses(int daysOld) {
        log.info("Starting automatic archive for courses older than {} days", daysOld);
        
        LocalDateTime cutoffDate = LocalDateTime.now().minus(daysOld, ChronoUnit.DAYS);
        List<Course> oldCourses = courseRepository.findArchivedCoursesOlderThan(cutoffDate);
        
        int archivedCount = 0;
        for (Course course : oldCourses) {
            course.setStatus(Course.CourseStatus.ARCHIVED);
            courseRepository.save(course);
            archivedCount++;
            log.info("Archived course: {} (ID: {})", course.getTitle(), course.getId());
        }
        
        log.info("Auto-archive completed. Archived {} courses", archivedCount);
        return archivedCount;
    }
    
    // ==================== HELPER METHODS ====================
    
    private CourseDTO enrichCourseDTO(CourseDTO dto) {
        Long enrollmentCount = courseRepository.countEnrollmentsByCourseId(dto.getId());
        dto.setEnrollmentCount(enrollmentCount);
        
        if (dto.getMaxStudents() != null && enrollmentCount != null) {
            dto.setAvailableSlots(dto.getMaxStudents() - enrollmentCount.intValue());
        }
        
        return dto;
    }
    
    private Specification<Course> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            return cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("courseCode")), "%" + keyword.toLowerCase() + "%")
            );
        };
    }
    
    private Specification<Course> hasLevel(Course.CourseLevel level) {
        return (root, query, cb) -> level == null ? null : cb.equal(root.get("level"), level);
    }
    
    private Specification<Course> hasStatus(Course.CourseStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }
    
    private Specification<Course> hasPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) {
                return null;
            }
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("price"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            }
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }
    
    private Specification<Course> hasDurationRange(Integer minDuration, Integer maxDuration) {
        return (root, query, cb) -> {
            if (minDuration == null && maxDuration == null) {
                return null;
            }
            if (minDuration != null && maxDuration != null) {
                return cb.between(root.get("durationHours"), minDuration, maxDuration);
            }
            if (minDuration != null) {
                return cb.greaterThanOrEqualTo(root.get("durationHours"), minDuration);
            }
            return cb.lessThanOrEqualTo(root.get("durationHours"), maxDuration);
        };
    }
    
    private Specification<Course> hasTeacherId(Long teacherId) {
        return (root, query, cb) -> teacherId == null ? null : cb.equal(root.get("teacherId"), teacherId);
    }
    
    private BigDecimal calculateAverage(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return values.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal calculateMedian(List<BigDecimal> values) {
        if (values == null || values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        int size = values.size();
        if (size % 2 == 0) {
            return values.get(size / 2 - 1)
                    .add(values.get(size / 2))
                    .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        }
        return values.get(size / 2);
    }
}
