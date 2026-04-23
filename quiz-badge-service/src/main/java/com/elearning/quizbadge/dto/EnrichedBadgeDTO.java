package com.elearning.quizbadge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Badge avec métadonnées cours résolues via OpenFeign (formation-service).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedBadgeDTO {

    private BadgeDTO badge;
    private String courseTitle;
    private String courseCode;
}
