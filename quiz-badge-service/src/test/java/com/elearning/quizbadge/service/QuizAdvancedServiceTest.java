package com.elearning.quizbadge.service;

import com.elearning.quizbadge.dto.ProctoringEventRequest;
import com.elearning.quizbadge.dto.QuizAnswerPayload;
import com.elearning.quizbadge.dto.QuizEligibilityResponse;
import com.elearning.quizbadge.dto.QuizSessionSubmitRequest;
import com.elearning.quizbadge.dto.QuizSessionSubmitResponse;
import com.elearning.quizbadge.entity.Quiz;
import com.elearning.quizbadge.entity.QuizAnswer;
import com.elearning.quizbadge.entity.QuizQuestion;
import com.elearning.quizbadge.entity.QuizSession;
import com.elearning.quizbadge.exception.ResourceNotFoundException;
import com.elearning.quizbadge.repository.QuizAnswerRepository;
import com.elearning.quizbadge.repository.QuizQuestionRepository;
import com.elearning.quizbadge.repository.QuizRepository;
import com.elearning.quizbadge.repository.QuizSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizAdvancedServiceTest {

    @Mock private QuizRepository quizRepository;
    @Mock private QuizQuestionRepository quizQuestionRepository;
    @Mock private QuizSessionRepository quizSessionRepository;
    @Mock private QuizAnswerRepository quizAnswerRepository;

    private QuizAdvancedService service;

    @BeforeEach
    void setUp() {
        service = new QuizAdvancedService(
                quizRepository,
                quizQuestionRepository,
                quizSessionRepository,
                quizAnswerRepository,
                new ObjectMapper()
        );
    }

    @Test
    void checkEligibility_disallowsWhenMaxAttemptsReached() {
        Quiz quiz = Quiz.builder().id(10L).chapterId(1L).title("T").maxAttempts(2).timeLimitSeconds(60).build();
        when(quizRepository.findById(10L)).thenReturn(Optional.of(quiz));
        when(quizSessionRepository.countByStudentIdAndQuizIdAndStatusInAndSubmittedAtBetween(
                eq(5L),
                eq(10L),
                any(),
                any(),
                any()
        )).thenReturn(2L);

        QuizEligibilityResponse r = service.checkEligibility(10L, 5L);

        assertThat(r.isAllowed()).isFalse();
        assertThat(r.getMaxAttempts()).isEqualTo(2);
        assertThat(r.getAttemptsUsed()).isEqualTo(2);
        assertThat(r.getMessage()).contains("maximum");
    }

    @Test
    void recordProctoringEvent_incrementsCorrectCounter_andTrimsDetail() {
        QuizSession session = QuizSession.builder()
                .id(77L)
                .studentId(3L)
                .quizId(9L)
                .status(QuizSession.SessionStatus.IN_PROGRESS)
                .proctoringPhoneCount(0)
                .build();
        when(quizSessionRepository.findById(77L)).thenReturn(Optional.of(session));

        String longDetail = "x".repeat(600);
        ProctoringEventRequest req = ProctoringEventRequest.builder()
                .studentId(3L)
                .quizId(9L)
                .eventType(ProctoringEventRequest.PHONE_DETECTED)
                .detail(longDetail)
                .build();

        service.recordProctoringEvent(77L, req);

        ArgumentCaptor<QuizSession> captor = ArgumentCaptor.forClass(QuizSession.class);
        verify(quizSessionRepository).save(captor.capture());
        assertThat(captor.getValue().getProctoringPhoneCount()).isEqualTo(1);
        assertThat(captor.getValue().getProctoringLastEvent()).isEqualTo(ProctoringEventRequest.PHONE_DETECTED);
        assertThat(captor.getValue().getProctoringLastEventAt()).isNotNull();
    }

    @Test
    void recordProctoringEvent_throwsOnUnknownType() {
        QuizSession session = QuizSession.builder()
                .id(77L)
                .studentId(3L)
                .quizId(9L)
                .status(QuizSession.SessionStatus.IN_PROGRESS)
                .build();
        when(quizSessionRepository.findById(77L)).thenReturn(Optional.of(session));

        ProctoringEventRequest req = ProctoringEventRequest.builder()
                .studentId(3L)
                .quizId(9L)
                .eventType("UNKNOWN")
                .detail("d")
                .build();

        assertThatThrownBy(() -> service.recordProctoringEvent(77L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("eventType inconnu");
    }

    @Test
    void submit_computesScore_persistsAnswers_andCompletesSession() {
        Quiz quiz = Quiz.builder()
                .id(10L)
                .chapterId(1L)
                .title("Quiz")
                .passingScorePercent(50)
                .timeLimitSeconds(null)
                .build();
        QuizSession session = QuizSession.builder()
                .id(501L)
                .studentId(5L)
                .quizId(10L)
                .status(QuizSession.SessionStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now().minusSeconds(10))
                .durationSeconds(0)
                .currentStep(0)
                .answersJson("[]")
                .tabHiddenCount(0)
                .clipboardBlockCount(0)
                .build();

        List<QuizQuestion> questions = List.of(
                QuizQuestion.builder().id(1L).quizId(10L).questionText("q1").correctAnswer("A").points(2).orderNumber(1).isActive(true).questionType(QuizQuestion.QuestionType.SHORT_ANSWER).build(),
                QuizQuestion.builder().id(2L).quizId(10L).questionText("q2").correctAnswer("B").points(3).orderNumber(2).isActive(true).questionType(QuizQuestion.QuestionType.SHORT_ANSWER).build()
        );

        when(quizSessionRepository.findById(501L)).thenReturn(Optional.of(session));
        when(quizRepository.findById(10L)).thenReturn(Optional.of(quiz));
        when(quizQuestionRepository.findByQuizIdOrderByOrderNumberAscIdAsc(10L)).thenReturn(questions);
        when(quizAnswerRepository.findByAttemptIdAndQuestionId(eq(501L), any())).thenReturn(Optional.empty());
        when(quizAnswerRepository.save(any(QuizAnswer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(quizSessionRepository.save(any(QuizSession.class))).thenAnswer(inv -> inv.getArgument(0));

        QuizSessionSubmitRequest req = QuizSessionSubmitRequest.builder()
                .studentId(5L)
                .quizId(10L)
                .durationSeconds(12)
                .tabHiddenCount(2)
                .clipboardBlockCount(1)
                .answers(List.of(
                        QuizAnswerPayload.builder().questionId(1L).answerText("a").timeSpentSeconds(3).markedForReview(false).build(), // correct (case-insensitive)
                        QuizAnswerPayload.builder().questionId(2L).answerText("").timeSpentSeconds(2).markedForReview(true).build()   // unanswered
                ))
                .build();

        QuizSessionSubmitResponse out = service.submit(501L, req);

        assertThat(out.getTotalPoints()).isEqualTo(5);
        assertThat(out.getPointsEarned()).isEqualTo(2);
        assertThat(out.getScorePercent()).isEqualTo(40);
        assertThat(out.isPassed()).isFalse();
        assertThat(out.getCorrectCount()).isEqualTo(1);
        assertThat(out.getUnansweredCount()).isEqualTo(1);
        assertThat(out.getWrongCount()).isEqualTo(0);
        assertThat(out.getTabHiddenCount()).isEqualTo(2);
        assertThat(out.getClipboardBlockCount()).isEqualTo(1);

        ArgumentCaptor<QuizSession> sessionCaptor = ArgumentCaptor.forClass(QuizSession.class);
        verify(quizSessionRepository, atLeastOnce()).save(sessionCaptor.capture());
        QuizSession saved = sessionCaptor.getAllValues().get(sessionCaptor.getAllValues().size() - 1);
        assertThat(saved.getStatus()).isEqualTo(QuizSession.SessionStatus.COMPLETED);
        assertThat(saved.getSubmittedAt()).isNotNull();
        assertThat(saved.getDurationSeconds()).isGreaterThanOrEqualTo(12);
        assertThat(saved.getTabHiddenCount()).isEqualTo(2);
        assertThat(saved.getClipboardBlockCount()).isEqualTo(1);
    }

    @Test
    void submit_throwsDuplicateSubmitWhenSessionNotInProgress() {
        QuizSession session = QuizSession.builder()
                .id(501L)
                .studentId(5L)
                .quizId(10L)
                .status(QuizSession.SessionStatus.COMPLETED)
                .build();
        when(quizSessionRepository.findById(501L)).thenReturn(Optional.of(session));

        QuizSessionSubmitRequest req = QuizSessionSubmitRequest.builder()
                .studentId(5L)
                .quizId(10L)
                .answers(List.of())
                .build();

        assertThatThrownBy(() -> service.submit(501L, req))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("DUPLICATE_SUBMIT");
    }

    @Test
    void checkEligibility_throwsWhenQuizMissing() {
        when(quizRepository.findById(123L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.checkEligibility(123L, 1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Quiz not found");
    }
}

