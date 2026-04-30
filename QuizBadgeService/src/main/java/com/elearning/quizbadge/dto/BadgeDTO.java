package com.elearning.quizbadge.dto;

import com.elearning.quizbadge.entity.Badge;
import lombok.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * Data Transfer Object for Badge entity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    
    private Long id;
    
    @NotNull(message = "Student ID is required")
    private Long studentId;
    
    @NotBlank(message = "Badge name is required")
    @Size(max = 100, message = "Badge name must not exceed 100 characters")
    private String badgeName;
    
    @NotNull(message = "Badge type is required")
    private Badge.BadgeType badgeType;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Size(max = 200, message = "Icon URL must not exceed 200 characters")
    private String iconUrl;
    
    private Long courseId;
    
    private Long questionId;
    
    @Size(max = 200, message = "Criteria met must not exceed 200 characters")
    private String criteriaMet;
    
    @NotNull(message = "Badge level is required")
    private Badge.BadgeLevel badgeLevel;
    
    @NotNull(message = "Earned date is required")
    private LocalDate earnedDate;
    
    /**
     * Convert Badge entity to BadgeDTO.
     */
    public static BadgeDTO fromEntity(Badge badge) {
        if (badge == null) {
            return null;
        }
        
        return BadgeDTO.builder()
                .id(badge.getId())
                .studentId(badge.getStudentId())
                .badgeName(badge.getBadgeName())
                .badgeType(badge.getBadgeType())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .courseId(badge.getCourseId())
                .questionId(badge.getQuestionId())
                .criteriaMet(badge.getCriteriaMet())
                .badgeLevel(badge.getBadgeLevel())
                .earnedDate(badge.getEarnedDate())
                .build();
    }
    
    /**
     * Convert BadgeDTO to Badge entity.
     */
    public Badge toEntity() {
        return Badge.builder()
                .id(this.id)
                .studentId(this.studentId)
                .badgeName(this.badgeName)
                .badgeType(this.badgeType)
                .description(this.description)
                .iconUrl(this.iconUrl)
                .courseId(this.courseId)
                .questionId(this.questionId)
                .criteriaMet(this.criteriaMet)
                .badgeLevel(this.badgeLevel)
                .earnedDate(this.earnedDate)
                .build();
    }
}
