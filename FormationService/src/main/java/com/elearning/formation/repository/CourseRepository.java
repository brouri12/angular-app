package com.elearning.formation.repository;

import com.elearning.formation.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Course entity operations.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    
    /**
     * Find course by course code.
     */
    Optional<Course> findByCourseCode(String courseCode);
    
    /**
     * Check if course code exists.
     */
    boolean existsByCourseCode(String courseCode);
    
    /**
     * Find all published courses.
     */
    Page<Course> findByStatus(Course.CourseStatus status, Pageable pageable);
    
    /**
     * Find courses by teacher ID.
     */
    List<Course> findByTeacherId(Long teacherId);
    
    /**
     * Find courses by level.
     */
    Page<Course> findByLevel(Course.CourseLevel level, Pageable pageable);
    
    /**
     * Find courses within price range.
     */
    Page<Course> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    /**
     * Search courses by title or description.
     */
    @Query("SELECT c FROM Course c WHERE c.title LIKE %:keyword% OR c.description LIKE %:keyword%")
    Page<Course> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Find courses by teacher and status.
     */
    List<Course> findByTeacherIdAndStatus(Long teacherId, Course.CourseStatus status);
    
    /**
     * Find archived courses older than specified date.
     */
    @Query("SELECT c FROM Course c WHERE c.status = 'ARCHIVED' AND c.updatedAt < :date")
    List<Course> findArchivedCoursesOlderThan(@Param("date") LocalDateTime date);
    
    /**
     * Get courses with available slots.
     */
    @Query("SELECT c FROM Course c WHERE c.maxStudents > (SELECT COUNT(e) FROM CourseEnrollment e WHERE e.courseId = c.id)")
    Page<Course> findCoursesWithAvailableSlots(Pageable pageable);
    
    /**
     * Count enrollments per course.
     */
    @Query("SELECT COUNT(e) FROM CourseEnrollment e WHERE e.courseId = :courseId")
    Long countEnrollmentsByCourseId(@Param("courseId") Long courseId);
}
