package com.elearning.formation.dto;

import com.elearning.formation.entity.Course;
import lombok.*;

import java.math.BigDecimal;

/**
 * Advanced search criteria for courses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSearchCriteria {
    
    private String keyword;
    private Course.CourseLevel level;
    private Course.CourseStatus status;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer minDurationHours;
    private Integer maxDurationHours;
    private Long teacherId;
    private Boolean availableOnly;
    
    // Pagination
    @Builder.Default
    private int page = 0;
    
    @Builder.Default
    private int size = 10;
    
    @Builder.Default
    private String sortBy = "createdAt";
    
    @Builder.Default
    private String sortDirection = "DESC";
}
