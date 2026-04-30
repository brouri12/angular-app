package com.elearning.quizbadge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Quiz (questions) d'un cours avec libellés cours via OpenFeign.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseQuizBundleDTO {

    private Long courseId;
    private String courseTitle;
    private String courseCode;
    private List<QuestionDTO> questions;
}
