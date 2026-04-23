package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.QuestionDTO;
import com.elearning.quizbadge.entity.Question;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.QuestionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionService questionService;

    private Question sampleEntity;
    private QuestionDTO sampleDto;

    @BeforeEach
    void setUp() {
        sampleEntity = Question.builder()
                .id(10L)
                .courseId(5L)
                .questionText("What is 2+2?")
                .questionType(Question.QuestionType.MULTIPLE_CHOICE)
                .points(2)
                .difficultyLevel(Question.DifficultyLevel.EASY)
                .correctAnswer("4")
                .orderNumber(1)
                .isActive(true)
                .build();

        sampleDto = QuestionDTO.builder()
                .courseId(5L)
                .questionText("What is 2+2?")
                .questionType(Question.QuestionType.MULTIPLE_CHOICE)
                .points(2)
                .difficultyLevel(Question.DifficultyLevel.EASY)
                .correctAnswer("4")
                .orderNumber(1)
                .isActive(null)
                .build();
    }

    @Test
    void createQuestion_setsIsActiveWhenNullAndReturnsDto() {
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> {
            Question q = invocation.getArgument(0);
            q.setId(99L);
            return q;
        });

        QuestionDTO result = questionService.createQuestion(sampleDto);

        ArgumentCaptor<Question> captor = ArgumentCaptor.forClass(Question.class);
        verify(questionRepository).save(captor.capture());
        assertThat(captor.getValue().getIsActive()).isTrue();
        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getQuestionText()).isEqualTo("What is 2+2?");
    }

    @Test
    void getQuestionById_returnsDtoWhenFound() {
        when(questionRepository.findById(10L)).thenReturn(Optional.of(sampleEntity));

        QuestionDTO result = questionService.getQuestionById(10L);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getCourseId()).isEqualTo(5L);
    }

    @Test
    void getQuestionById_throwsWhenMissing() {
        when(questionRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> questionService.getQuestionById(404L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("404");
    }

    @Test
    void getQuestionsByCourse_returnsMappedList() {
        when(questionRepository.findByCourseId(5L)).thenReturn(List.of(sampleEntity));

        List<QuestionDTO> list = questionService.getQuestionsByCourse(5L);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getQuestionText()).isEqualTo("What is 2+2?");
    }

    @Test
    void deleteQuestion_throwsWhenMissing() {
        when(questionRepository.existsById(7L)).thenReturn(false);

        assertThatThrownBy(() -> questionService.deleteQuestion(7L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteQuestion_callsRepositoryWhenExists() {
        when(questionRepository.existsById(7L)).thenReturn(true);

        questionService.deleteQuestion(7L);

        verify(questionRepository).deleteById(7L);
    }
}
