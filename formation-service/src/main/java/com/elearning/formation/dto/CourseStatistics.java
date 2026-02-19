package com.elearning.formation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Course statistics DTO for analytics.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseStatistics {
    
    private Long courseId;
    private String courseTitle;
    
    // Enrollment statistics
    private Long totalEnrollments;
    private Long activeEnrollments;
    private Long completedEnrollments;
    private Long droppedEnrollments;
    
    // Progress statistics
    private BigDecimal averageCompletionPercentage;
    private BigDecimal medianCompletionPercentage;
    private BigDecimal minCompletionPercentage;
    private BigDecimal maxCompletionPercentage;
    
    // Grade statistics
    private BigDecimal averageGrade;
    private BigDecimal medianGrade;
    private BigDecimal minGrade;
    private BigDecimal maxGrade;
    private BigDecimal passRate;
    
    // Time-based statistics
    private Double averageTimeToComplete;
    private Integer fastestCompletionDays;
    private Integer slowestCompletionDays;
    
    // Revenue statistics
    private BigDecimal totalRevenue;
    private BigDecimal averageRevenuePerStudent;
    
    // Student distribution
    private Map<String, Long> enrollmentsByMonth;
    private Map<String, Long> completionsByMonth;
    private List<String> topStudentIds;
    
    // Status
    private Long availableSlots;
    private Double occupancyRate;
    
    // Trend
    private Double enrollmentTrend;
    private Double completionTrend;
}
