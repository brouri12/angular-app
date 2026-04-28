package tn.esprit.challenge.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.challenge.dto.SubmissionRequest;
import tn.esprit.challenge.dto.SubmissionResponse;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Question;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.enums.*;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.QuestionRepository;
import tn.esprit.challenge.repository.SubmissionRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubmissionService Unit Tests")
class SubmissionServiceTest {

    @Mock  SubmissionRepository submissionRepository;
    @Mock  ChallengeRepository  challengeRepository;
    @Mock  QuestionRepository   questionRepository;
    @Mock  ChallengeService     challengeService;
    @InjectMocks SubmissionService submissionService;

    private Challenge challenge;
    private Question  q1, q2, q3;

    @BeforeEach
    void setUp() {
        challenge = new Challenge();
        challenge.setId(1L);
        challenge.setTitle("Grammar Test");
        challenge.setType(ChallengeType.GRAMMAR);
        challenge.setSkillFocus(SkillFocus.GRAMMAR);
        challenge.setLevel(ProficiencyLevel.B1);
        challenge.setPoints(100);
        challenge.setIsPublic(true);
        challenge.setIsExpired(false);
        challenge.setTotalAttempts(0);
        challenge.setSuccessfulCompletions(0);
        challenge.setAverageRating(0.0);

        q1 = question(1L, "What is the past tense of 'go'?", "went", 20);
        q2 = question(2L, "True or False: 'She go to school'", "False", 20);
        q3 = question(3L, "Fill: She ___ (be) happy.", "was", 20);
    }

    private Question question(Long id, String text, String answer, int points) {
        Question q = new Question();
        q.setId(id);
        q.setQuestionText(text);
        q.setCorrectAnswer(answer);
        q.setPoints(points);
        q.setType(QuestionType.MULTIPLE_CHOICE);
        q.setOrderIndex(id.intValue() - 1);
        return q;
    }

    private Submission savedSubmission(int correct, int total, SubmissionStatus status) {
        Submission s = new Submission();
        s.setId(100L);
        s.setChallengeId(1L);
        s.setUserId(42L);
        s.setCorrectAnswers(correct);
        s.setTotalQuestions(total);
        s.setScore(correct * 20);
        s.setStatus(status);
        s.setFeedback("Test feedback");
        s.setSubmittedAt(LocalDateTime.now());
        s.setAnswers(new HashMap<>());
        return s;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // submitChallenge — PASSED (≥70%)
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("submitChallenge() — PASSED")
    class SubmitPassed {

        @Test
        @DisplayName("status is PASSED when all 3 answers are correct (100%)")
        void shouldPassWhenAllCorrect() {
            Map<Long, String> answers = new HashMap<>();
            answers.put(1L, "went");
            answers.put(2L, "False");
            answers.put(3L, "was");

            SubmissionRequest req = new SubmissionRequest();
            req.setChallengeId(1L);
            req.setUserId(42L);
            req.setAnswers(answers);

            when(challengeRepository.findById(1L)).thenReturn(Optional.of(challenge));
            when(questionRepository.findByChallengeIdOrderByOrderIndexAsc(1L))
                    .thenReturn(List.of(q1, q2, q3));
            when(submissionRepository.save(any())).thenReturn(savedSubmission(3, 3, SubmissionStatus.PASSED));

            SubmissionResponse response = submissionService.submitChallenge(req);

            assertThat(response.getPassed()).isTrue();
            assertThat(response.getStatus()).isEqualTo(SubmissionStatus.PASSED);
            verify(challengeService).incrementSuccessfulCompletions(1L);
            verify(challengeService).incrementAttempts(1L);
        }

        @Test
        @DisplayName("status is PARTIAL when 2 out of 3 answers are correct (66%)")
        void shouldBePartialWhenTwoOutOfThreeCorrect() {
            Map<Long, String> answers = new HashMap<>();
            answers.put(1L, "went");
            answers.put(2L, "False");
            answers.put(3L, "WRONG");

            SubmissionRequest req = new SubmissionRequest();
            req.setChallengeId(1L);
            req.setUserId(42L);
            req.setAnswers(answers);

            when(challengeRepository.findById(1L)).thenReturn(Optional.of(challenge));
            when(questionRepository.findByChallengeIdOrderByOrderIndexAsc(1L))
                    .thenReturn(List.of(q1, q2, q3));
            when(submissionRepository.save(any())).thenReturn(savedSubmission(2, 3, SubmissionStatus.PARTIAL));

            SubmissionResponse response = submissionService.submitChallenge(req);

            // 2/3 = 66.6% → PARTIAL (50–70%)
            assertThat(response.getStatus()).isEqualTo(SubmissionStatus.PARTIAL);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // submitChallenge — FAILED (<50%)
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("submitChallenge() — FAILED")
    class SubmitFailed {

        @Test
        @DisplayName("status is FAILED when all answers are wrong (0%)")
        void shouldFailWhenAllWrong() {
            Map<Long, String> answers = new HashMap<>();
            answers.put(1L, "WRONG");
            answers.put(2L, "WRONG");
            answers.put(3L, "WRONG");

            SubmissionRequest req = new SubmissionRequest();
            req.setChallengeId(1L);
            req.setUserId(42L);
            req.setAnswers(answers);

            when(challengeRepository.findById(1L)).thenReturn(Optional.of(challenge));
            when(questionRepository.findByChallengeIdOrderByOrderIndexAsc(1L))
                    .thenReturn(List.of(q1, q2, q3));
            when(submissionRepository.save(any())).thenReturn(savedSubmission(0, 3, SubmissionStatus.FAILED));

            SubmissionResponse response = submissionService.submitChallenge(req);

            assertThat(response.getPassed()).isFalse();
            assertThat(response.getStatus()).isEqualTo(SubmissionStatus.FAILED);
            verify(challengeService, never()).incrementSuccessfulCompletions(any());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // submitChallenge — challenge not found
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("submitChallenge() — challenge not found")
    class SubmitChallengeNotFound {

        @Test
        @DisplayName("throws RuntimeException when challenge does not exist")
        void shouldThrowWhenChallengeNotFound() {
            SubmissionRequest req = new SubmissionRequest();
            req.setChallengeId(999L);
            req.setUserId(1L);
            // use the Long-keyed setter directly to avoid type mismatch
            req.setAnswers(new HashMap<>());

            when(challengeRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> submissionService.submitChallenge(req))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Challenge not found");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getSubmissionById
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getSubmissionById()")
    class GetSubmissionById {

        @Test
        @DisplayName("returns submission response when found")
        void shouldReturnSubmissionWhenFound() {
            Submission s = savedSubmission(3, 3, SubmissionStatus.PASSED);
            when(submissionRepository.findById(100L)).thenReturn(Optional.of(s));
            when(questionRepository.findByChallengeIdOrderByOrderIndexAsc(1L))
                    .thenReturn(List.of(q1, q2, q3));

            SubmissionResponse response = submissionService.getSubmissionById(100L);

            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(100L);
        }

        @Test
        @DisplayName("throws RuntimeException when submission not found")
        void shouldThrowWhenNotFound() {
            when(submissionRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> submissionService.getSubmissionById(999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Submission not found");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getUserTotalScore
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getUserTotalScore()")
    class GetUserTotalScore {

        @Test
        @DisplayName("returns total score from repository")
        void shouldReturnTotalScore() {
            when(submissionRepository.getTotalScoreByUserId(42L)).thenReturn(350);

            Integer score = submissionService.getUserTotalScore(42L);

            assertThat(score).isEqualTo(350);
        }
    }
}
