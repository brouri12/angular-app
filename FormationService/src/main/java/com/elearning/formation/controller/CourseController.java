package com.elearning.formation.controller;

import com.elearning.formation.dto.*;
import com.elearning.formation.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for Course operations.
 */
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CourseController {
    
    private final CourseService courseService;
    
    /**
     * Create a new course.
     */
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@Valid @RequestBody CourseDTO courseDTO) {
        log.info("POST /api/courses - Creating new course");
        CourseDTO created = courseService.createCourse(courseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Get course by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        log.info("GET /api/courses/{}", id);
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }
    
    /**
     * Get course by course code.
     */
    @GetMapping("/code/{courseCode}")
    public ResponseEntity<CourseDTO> getCourseByCode(@PathVariable String courseCode) {
        log.info("GET /api/courses/code/{}", courseCode);
        CourseDTO course = courseService.getCourseByCode(courseCode);
        return ResponseEntity.ok(course);
    }
    
    /**
     * Get all courses with pagination.
     */
    @GetMapping
    public ResponseEntity<Page<CourseDTO>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        log.info("GET /api/courses - page: {}, size: {}", page, size);
        Page<CourseDTO> courses = courseService.getAllCourses(page, size, sortBy, direction);
        return ResponseEntity.ok(courses);
    }
    
    /**
     * Update course.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseDTO courseDTO) {
        log.info("PUT /api/courses/{}", id);
        CourseDTO updated = courseService.updateCourse(id, courseDTO);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete course.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        log.info("DELETE /api/courses/{}", id);
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
    
    // ==================== ADVANCED OPERATIONS ====================
    
    /**
     * Advanced multi-criteria course search.
     */
    @PostMapping("/search")
    public ResponseEntity<Page<CourseDTO>> searchCoursesAdvanced(@RequestBody CourseSearchCriteria criteria) {
        log.info("POST /api/courses/search - Advanced search");
        Page<CourseDTO> courses = courseService.searchCoursesAdvanced(criteria);
        return ResponseEntity.ok(courses);
    }
    
    /**
     * Get AI-recommended courses for a student.
     */
    @GetMapping("/recommendations/{studentId}")
    public ResponseEntity<List<CourseDTO>> getRecommendedCourses(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /api/courses/recommendations/{} - limit: {}", studentId, limit);
        List<CourseDTO> recommendations = courseService.getRecommendedCourses(studentId, limit);
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Get course statistics.
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<CourseStatistics> getCourseStatistics(@PathVariable Long id) {
        log.info("GET /api/courses/{}/statistics", id);
        CourseStatistics stats = courseService.getCourseStatistics(id);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Archive old courses.
     */
    @PostMapping("/archive-old")
    public ResponseEntity<Integer> autoArchiveOldCourses(
            @RequestParam(defaultValue = "365") int daysOld) {
        log.info("POST /api/courses/archive-old - daysOld: {}", daysOld);
        int archivedCount = courseService.autoArchiveOldCourses(daysOld);
        return ResponseEntity.ok(archivedCount);
    }
    
    /**
     * Test endpoint to verify service is running.
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        log.info("GET /api/courses/test - Service test endpoint called");
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Formation Service");
        response.put("port", "8081");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
}
