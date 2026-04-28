package tn.esprit.challenge.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import tn.esprit.challenge.dto.PredictionDTO;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Submission;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.SkillFocus;
import tn.esprit.challenge.enums.SubmissionStatus;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.SubmissionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PredictionService Unit Tests")
class PredictionServiceTest {

    @Mock  SubmissionRepository submissionRepository;
    @Mock  ChallengeRepository  challengeRepository;
    @InjectMocks PredictionService predictionService;

    private Challenge grammarB1;

    @BeforeEach
    void setUp() {
        grammarB1 = new Challenge();
        grammarB1.setId(10L);
        grammarB1.setTitle("Grammar B1");
        grammarB1.setType(ChallengeType.GRAMMAR);
        grammarB1.setSkillFocus(SkillFocus.GRAMMAR);
        grammarB1.setLevel(ProficiencyLevel.B1);
        grammarB1.setPoints(100);
        grammarB1.setIsPublic(true);
        grammarB1.setIsExpired(false);
        grammarB1.setTotalAttempts(0);
        grammarB1.setSuccessfulCompletions(0);
        grammarB1.setAverageRating(0.0);
    }

    private Submission submission(Long userId, Long challengeId, SubmissionStatus status) {
        Submission s = new Submission();
        s.setUserId(userId);
        s.setChallengeId(challengeId);
        s.setStatus(status);
        s.setScore(status == SubmissionStatus.PASSED ? 80 : 30);
        s.setCorrectAnswers(status == SubmissionStatus.PASSED ? 4 : 1);
        s.setTotalQuestions(5);
        s.setSubmittedAt(LocalDateTime.now().minusDays(1));
        return s;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // predict — no history
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("predict() — no history")
    class NoHistory {

        @Test
        @DisplayName("returns neutral prediction with advice for new user")
        void shouldReturnNeutralForNewUser() {
            when(challengeRepository.findById(10L)).thenReturn(Optional.of(grammarB1));
            when(submissionRepository.findByUserIdOrderBySubmittedAtDesc(1L)).thenReturn(List.of());
            when(submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(10L)).thenReturn(List.of());

            PredictionDTO result = predictionService.predict(1L, 10L);

            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(1L);
            assertThat(result.getChallengeId()).isEqualTo(10L);
            assertThat(result.getSuccessProbability()).isBetween(5.0, 97.0);
            assertThat(result.getTotalSubmissions()).isEqualTo(0);
            assertThat(result.getAdvice()).contains("No history yet");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // predict — high performer
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("predict() — high performer")
    class HighPerformer {

        @Test
        @DisplayName("returns HIGH confidence for user with all PASSED submissions")
        void shouldReturnHighConfidenceForExpertUser() {
            // User has 5 passed submissions on the same challenge
            List<Submission> userSubs = List.of(
                    submission(1L, 10L, SubmissionStatus.PASSED),
                    submission(1L, 10L, SubmissionStatus.PASSED),
                    submission(1L, 10L, SubmissionStatus.PASSED),
                    submission(1L, 10L, SubmissionStatus.PASSED),
                    submission(1L, 10L, SubmissionStatus.PASSED)
            );

            when(challengeRepository.findById(10L)).thenReturn(Optional.of(grammarB1));
            when(challengeRepository.findById(anyLong())).thenReturn(Optional.of(grammarB1));
            when(submissionRepository.findByUserIdOrderBySubmittedAtDesc(1L)).thenReturn(userSubs);
            when(submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(10L)).thenReturn(userSubs);

            PredictionDTO result = predictionService.predict(1L, 10L);

            assertThat(result.getSuccessProbability()).isGreaterThanOrEqualTo(70.0);
            assertThat(result.getConfidence()).isEqualTo("HIGH");
            assertThat(result.getCurrentStreak()).isEqualTo(5);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // predict — low performer
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("predict() — low performer")
    class LowPerformer {

        @Test
        @DisplayName("returns LOW confidence for user with all FAILED submissions")
        void shouldReturnLowConfidenceForWeakUser() {
            List<Submission> userSubs = List.of(
                    submission(2L, 10L, SubmissionStatus.FAILED),
                    submission(2L, 10L, SubmissionStatus.FAILED),
                    submission(2L, 10L, SubmissionStatus.FAILED)
            );

            when(challengeRepository.findById(10L)).thenReturn(Optional.of(grammarB1));
            when(challengeRepository.findById(anyLong())).thenReturn(Optional.of(grammarB1));
            when(submissionRepository.findByUserIdOrderBySubmittedAtDesc(2L)).thenReturn(userSubs);
            when(submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(10L)).thenReturn(userSubs);

            PredictionDTO result = predictionService.predict(2L, 10L);

            assertThat(result.getSuccessProbability()).isLessThan(50.0);
            assertThat(result.getConfidence()).isEqualTo("LOW");
            assertThat(result.getCurrentStreak()).isEqualTo(0);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // predict — probability clamping
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("predict() — probability clamping")
    class Clamping {

        @Test
        @DisplayName("probability is always between 5 and 97")
        void probabilityShouldAlwaysBeClamped() {
            when(challengeRepository.findById(anyLong())).thenReturn(Optional.of(grammarB1));
            when(submissionRepository.findByUserIdOrderBySubmittedAtDesc(anyLong())).thenReturn(List.of());
            when(submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(anyLong())).thenReturn(List.of());

            PredictionDTO result = predictionService.predict(99L, 10L);

            assertThat(result.getSuccessProbability())
                    .isGreaterThanOrEqualTo(5.0)
                    .isLessThanOrEqualTo(97.0);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // predict — challenge not found
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("predict() — challenge not found")
    class ChallengeNotFound {

        @Test
        @DisplayName("throws RuntimeException when challenge does not exist")
        void shouldThrowWhenChallengeNotFound() {
            when(challengeRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> predictionService.predict(1L, 999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("999");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // predict — level adjustment
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("predict() — level difficulty adjustment")
    class LevelAdjustment {

        @Test
        @DisplayName("C1 challenge has lower probability than A1 for same user profile")
        void c1ShouldHaveLowerProbabilityThanA1() {
            Challenge a1Challenge = buildChallenge(20L, ProficiencyLevel.A1);
            Challenge c1Challenge = buildChallenge(21L, ProficiencyLevel.C1);

            List<Submission> subs = List.of(
                    submission(5L, 20L, SubmissionStatus.PASSED),
                    submission(5L, 20L, SubmissionStatus.PASSED)
            );

            // A1 prediction — stub both findById calls
            when(challengeRepository.findById(20L)).thenReturn(Optional.of(a1Challenge));
            when(challengeRepository.findById(anyLong())).thenReturn(Optional.of(a1Challenge));
            when(submissionRepository.findByUserIdOrderBySubmittedAtDesc(5L)).thenReturn(subs);
            when(submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(20L)).thenReturn(subs);
            PredictionDTO a1Result = predictionService.predict(5L, 20L);

            // C1 prediction — override stubs for new challenge
            when(challengeRepository.findById(21L)).thenReturn(Optional.of(c1Challenge));
            when(challengeRepository.findById(anyLong())).thenReturn(Optional.of(c1Challenge));
            when(submissionRepository.findByChallengeIdOrderBySubmittedAtDesc(21L)).thenReturn(subs);
            PredictionDTO c1Result = predictionService.predict(5L, 21L);

            assertThat(a1Result.getSuccessProbability())
                    .isGreaterThan(c1Result.getSuccessProbability());
        }

        private Challenge buildChallenge(Long id, ProficiencyLevel level) {
            Challenge c = new Challenge();
            c.setId(id);
            c.setTitle("Challenge " + level);
            c.setType(ChallengeType.GRAMMAR);
            c.setSkillFocus(SkillFocus.GRAMMAR);
            c.setLevel(level);
            c.setPoints(100);
            c.setIsPublic(true);
            c.setIsExpired(false);
            c.setTotalAttempts(0);
            c.setSuccessfulCompletions(0);
            c.setAverageRating(0.0);
            return c;
        }
    }
}
