package com.elearning.quizbadge.repository;

import com.elearning.quizbadge.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for CourseEnrollment entity operations.
 */
@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    
    /**
     * Find enrollments by student ID.
     */
    List<CourseEnrollment> findByStudentId(Long studentId);
    
    /**
     * Find enrollments by course ID.
     */
    List<CourseEnrollment> findByCourseId(Long courseId);
    
    /**
     * Find enrollments by student ID and completion percentage.
     */
    @Query("SELECT e FROM CourseEnrollment e WHERE e.studentId = :studentId AND e.completionPercentage IS NOT NULL AND e.completionPercentage >= :percentage")
    List<CourseEnrollment> findCompletedEnrollmentsByStudentAndPercentage(@Param("studentId") Long studentId, @Param("percentage") Double percentage);
    
    /**
     * Count completed courses by student.
     */
    @Query("SELECT COUNT(e) FROM CourseEnrollment e WHERE e.studentId = :studentId AND e.completionPercentage = 100")
    Long countCompletedCoursesByStudent(@Param("studentId") Long studentId);
    
    /**
     * Find enrollments with final grade.
     */
    @Query("SELECT e FROM CourseEnrollment e WHERE e.studentId = :studentId AND e.finalGrade IS NOT NULL")
    List<CourseEnrollment> findEnrollmentsWithFinalGrade(@Param("studentId") Long studentId);
}
