package com.elearning.formation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Student report DTO for enrollment analytics.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentReport {
    
    private Long studentId;
    private String studentName;
    private LocalDate reportGeneratedDate;
    
    // Overall statistics
    private Integer totalEnrollments;
    private Integer completedCourses;
    private Integer droppedCourses;
    private Integer inProgressCourses;
    
    // Grade statistics
    private BigDecimal overallAverageGrade;
    private BigDecimal highestGrade;
    private BigDecimal lowestGrade;
    
    // Time statistics
    private Integer totalLearningHours;
    private Double averageCompletionTimeDays;
    private Integer longestStreakDays;
    
    // Progress statistics
    private BigDecimal overallCompletionRate;
    private BigDecimal predictedDropoutRisk;
    
    // Course details
    private List<EnrollmentDetail> courseDetails;
    
    // Achievements
    private List<String> badges;
    private List<String> certificates;
    
    // Insights
    private String learningPattern;
    private List<String> recommendations;
    private List<String> riskFactors;
    
    // Performance by level
    private Map<String, BigDecimal> averageGradeByLevel;
    private Map<String, BigDecimal> completionRateByLevel;
    
    /**
     * Detailed enrollment information for report.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EnrollmentDetail {
        private Long enrollmentId;
        private String courseTitle;
        private String courseCode;
        private LocalDate enrollmentDate;
        private LocalDate completionDate;
        private BigDecimal completionPercentage;
        private BigDecimal finalGrade;
        private String status;
        private Integer durationHours;
        private Boolean hasAbnormalProgress;
        private Boolean atRiskOfDropout;
    }
}
