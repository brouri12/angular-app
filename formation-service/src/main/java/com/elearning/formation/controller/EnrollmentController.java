package com.elearning.formation.controller;

import com.elearning.formation.dto.EnrollmentDTO;
import com.elearning.formation.dto.StudentReport;
import com.elearning.formation.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST controller for Enrollment operations.
 */
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Slf4j
public class EnrollmentController {
    
    private final EnrollmentService enrollmentService;
    
    /**
     * Create a new enrollment.
     */
    @PostMapping
    public ResponseEntity<EnrollmentDTO> createEnrollment(@Valid @RequestBody EnrollmentDTO enrollmentDTO) {
        log.info("POST /api/enrollments - Creating new enrollment");
        EnrollmentDTO created = enrollmentService.createEnrollment(enrollmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Get enrollment by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentDTO> getEnrollmentById(@PathVariable Long id) {
        log.info("GET /api/enrollments/{}", id);
        EnrollmentDTO enrollment = enrollmentService.getEnrollmentById(id);
        return ResponseEntity.ok(enrollment);
    }
    
    /**
     * Get all enrollments with pagination.
     */
    @GetMapping
    public ResponseEntity<Page<EnrollmentDTO>> getAllEnrollments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("GET /api/enrollments - page: {}, size: {}", page, size);
        Page<EnrollmentDTO> enrollments = enrollmentService.getAllEnrollments(page, size);
        return ResponseEntity.ok(enrollments);
    }
    
    /**
     * Get enrollments by student ID.
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        log.info("GET /api/enrollments/student/{}", studentId);
        List<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        return ResponseEntity.ok(enrollments);
    }
    
    /**
     * Get enrollments by course ID.
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        log.info("GET /api/enrollments/course/{}", courseId);
        List<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        return ResponseEntity.ok(enrollments);
    }
    
    /**
     * Update enrollment.
     */
    @PutMapping("/{id}")
    public ResponseEntity<EnrollmentDTO> updateEnrollment(
            @PathVariable Long id,
            @Valid @RequestBody EnrollmentDTO enrollmentDTO) {
        log.info("PUT /api/enrollments/{}", id);
        EnrollmentDTO updated = enrollmentService.updateEnrollment(id, enrollmentDTO);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete enrollment.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        log.info("DELETE /api/enrollments/{}", id);
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }
    
    // ==================== ADVANCED OPERATIONS ====================
    
    /**
     * Calculate progress automatically for an enrollment.
     */
    @PostMapping("/{id}/calculate-progress")
    public ResponseEntity<EnrollmentDTO> calculateProgressAutomatically(@PathVariable Long id) {
        log.info("POST /api/enrollments/{}/calculate-progress", id);
        EnrollmentDTO updated = enrollmentService.calculateProgressAutomatically(id);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Predict dropout risk for an enrollment.
     */
    @GetMapping("/{id}/dropout-risk")
    public ResponseEntity<BigDecimal> predictDropoutRisk(@PathVariable Long id) {
        log.info("GET /api/enrollments/{}/dropout-risk", id);
        BigDecimal risk = enrollmentService.predictDropoutRisk(id);
        return ResponseEntity.ok(risk);
    }
    
    /**
     * Detect abnormal progress patterns in a course.
     */
    @GetMapping("/course/{courseId}/abnormal-progress")
    public ResponseEntity<List<EnrollmentDTO>> detectAbnormalProgress(@PathVariable Long courseId) {
        log.info("GET /api/enrollments/course/{}/abnormal-progress", courseId);
        List<EnrollmentDTO> abnormalEnrollments = enrollmentService.detectAbnormalProgress(courseId);
        return ResponseEntity.ok(abnormalEnrollments);
    }
    
    /**
     * Generate comprehensive student report.
     */
    @GetMapping("/student/{studentId}/report")
    public ResponseEntity<StudentReport> generateStudentReport(@PathVariable Long studentId) {
        log.info("GET /api/enrollments/student/{}/report", studentId);
        StudentReport report = enrollmentService.generateStudentReport(studentId);
        return ResponseEntity.ok(report);
    }
}
