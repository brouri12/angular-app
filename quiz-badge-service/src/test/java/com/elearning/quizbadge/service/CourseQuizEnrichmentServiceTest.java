package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.CourseQuizBundleDTO;
import com.elearning.quizbadge.dto.QuestionDTO;
import com.elearning.quizbadge.dto.RemoteCourseDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseQuizEnrichmentServiceTest {

    @Mock
    private QuestionService questionService;

    @Mock
    private FormationCourseLookupService formationCourseLookupService;

    @InjectMocks
    private CourseQuizEnrichmentService service;

    @Test
    void getQuestionsForCourseWithFormationMeta_includesMetaWhenFound() {
        RemoteCourseDTO course = RemoteCourseDTO.builder().id(5L).title("T").courseCode("C-01").build();
        when(formationCourseLookupService.findCourse(5L)).thenReturn(Optional.of(course));
        when(questionService.getQuestionsByCourse(5L)).thenReturn(List.of(QuestionDTO.builder().id(1L).courseId(5L).questionText("q").build()));

        CourseQuizBundleDTO dto = service.getQuestionsForCourseWithFormationMeta(5L);

        assertThat(dto.getCourseId()).isEqualTo(5L);
        assertThat(dto.getCourseTitle()).isEqualTo("T");
        assertThat(dto.getCourseCode()).isEqualTo("C-01");
        assertThat(dto.getQuestions()).hasSize(1);
    }

    @Test
    void getQuestionsForCourseWithFormationMeta_leavesMetaNullWhenMissing() {
        when(formationCourseLookupService.findCourse(5L)).thenReturn(Optional.empty());
        when(questionService.getQuestionsByCourse(5L)).thenReturn(List.of());

        CourseQuizBundleDTO dto = service.getQuestionsForCourseWithFormationMeta(5L);

        assertThat(dto.getCourseTitle()).isNull();
        assertThat(dto.getCourseCode()).isNull();
        assertThat(dto.getQuestions()).isEmpty();
    }
}

