package com.elearning.formation.repository;

import com.elearning.formation.entity.CourseEnrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for CourseEnrollment entity operations.
 */
@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    
    /**
     * Find enrollment by course and student.
     */
    Optional<CourseEnrollment> findByCourseIdAndStudentId(Long courseId, Long studentId);
    
    /**
     * Check if student is enrolled in course.
     */
    boolean existsByCourseIdAndStudentId(Long courseId, Long studentId);
    
    /**
     * Find all enrollments for a student.
     */
    List<CourseEnrollment> findByStudentId(Long studentId);
    
    /**
     * Find all enrollments for a course.
     */
    List<CourseEnrollment> findByCourseId(Long courseId);
    
    /**
     * Find enrollments by status.
     */
    List<CourseEnrollment> findByStatus(CourseEnrollment.EnrollmentStatus status);
    
    /**
     * Find active enrollments for a student.
     */
    List<CourseEnrollment> findByStudentIdAndStatus(Long studentId, CourseEnrollment.EnrollmentStatus status);
    
    /**
     * Find enrollments completed within date range.
     */
    @Query("SELECT e FROM CourseEnrollment e WHERE e.status = 'COMPLETED' AND e.enrollmentDate BETWEEN :startDate AND :endDate")
    List<CourseEnrollment> findCompletedEnrollmentsBetweenDates(
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);
    
    /**
     * Find enrollments with low completion percentage.
     */
    @Query("SELECT e FROM CourseEnrollment e WHERE e.completionPercentage < :threshold AND e.status = 'ACTIVE'")
    List<CourseEnrollment> findLowProgressEnrollments(@Param("threshold") BigDecimal threshold);
    
    /**
     * Find enrollments by student with pagination.
     */
    Page<CourseEnrollment> findByStudentId(Long studentId, Pageable pageable);
    
    /**
     * Find enrollments by course with pagination.
     */
    Page<CourseEnrollment> findByCourseId(Long courseId, Pageable pageable);
    
    /**
     * Count active enrollments for a course.
     */
    @Query("SELECT COUNT(e) FROM CourseEnrollment e WHERE e.courseId = :courseId AND e.status = 'ACTIVE'")
    Long countActiveEnrollmentsByCourseId(@Param("courseId") Long courseId);
    
    /**
     * Calculate average completion percentage for a course.
     */
    @Query("SELECT AVG(e.completionPercentage) FROM CourseEnrollment e WHERE e.courseId = :courseId")
    BigDecimal calculateAverageCompletionForCourse(@Param("courseId") Long courseId);
    
    /**
     * Find students at risk of dropping out (low progress after significant time).
     */
    @Query("SELECT e FROM CourseEnrollment e WHERE e.status = 'ACTIVE' " +
           "AND e.completionPercentage < :threshold")
    List<CourseEnrollment> findAtRiskEnrollments(
            @Param("threshold") BigDecimal threshold);
    
    /**
     * Find enrollments with abnormal progress patterns.
     */
    @Query("SELECT e FROM CourseEnrollment e WHERE e.studentId = :studentId " +
           "AND e.courseId = :courseId " +
           "AND e.completionPercentage > :maxPossible " +
           "AND e.status = 'ACTIVE'")
    List<CourseEnrollment> findAbnormalProgress(
            @Param("studentId") Long studentId,
            @Param("courseId") Long courseId,
            @Param("maxPossible") BigDecimal maxPossible);
}
