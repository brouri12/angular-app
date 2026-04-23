package com.elearning.quizbadge.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Sous-ensemble du {@code CourseDTO} de formation-service (JSON compatible).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RemoteCourseDTO {

    private Long id;
    private String courseCode;
    private String title;
}
