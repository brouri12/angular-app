package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.CourseQuizBundleDTO;
import com.elearning.quizbadge.dto.RemoteCourseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseQuizEnrichmentService {

    private final QuestionService questionService;
    private final FormationCourseLookupService formationCourseLookupService;

    @Transactional(readOnly = true)
    public CourseQuizBundleDTO getQuestionsForCourseWithFormationMeta(Long courseId) {
        Optional<RemoteCourseDTO> course = formationCourseLookupService.findCourse(courseId);
        return CourseQuizBundleDTO.builder()
                .courseId(courseId)
                .courseTitle(course.map(RemoteCourseDTO::getTitle).orElse(null))
                .courseCode(course.map(RemoteCourseDTO::getCourseCode).orElse(null))
                .questions(questionService.getQuestionsByCourse(courseId))
                .build();
    }
}
