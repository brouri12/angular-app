package tn.esprit.challenge.scheduler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.entity.Question;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.QuestionRepository;

import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("WeeklyChallengeScheduler Unit Tests")
class WeeklyChallengeSchedulerTest {

    @Mock  ChallengeRepository challengeRepository;
    @Mock  QuestionRepository  questionRepository;
    @InjectMocks WeeklyChallengeScheduler scheduler;

    @BeforeEach
    void setUp() {
        // Make save() return the challenge with an ID so questions can be linked
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(inv -> {
            Challenge c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });
        when(questionRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    // ══════════════════════════════════════════════════════════════════════════
    // createWeeklyChallenge
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("createWeeklyChallenge()")
    class CreateWeeklyChallenge {

        @Test
        @DisplayName("saves exactly one challenge to the repository")
        void shouldSaveOneChallenge() {
            scheduler.createWeeklyChallenge();

            verify(challengeRepository, times(1)).save(any(Challenge.class));
        }

        @Test
        @DisplayName("saves exactly 5 questions for the challenge")
        void shouldSaveFiveQuestions() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<List<Question>> captor = ArgumentCaptor.forClass(List.class);
            verify(questionRepository, times(1)).saveAll(captor.capture());

            List<Question> savedQuestions = captor.getValue();
            assertThat(savedQuestions).hasSize(5);
        }

        @Test
        @DisplayName("challenge title contains 'Weekly Challenge'")
        void shouldHaveWeeklyInTitle() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<Challenge> captor = ArgumentCaptor.forClass(Challenge.class);
            verify(challengeRepository).save(captor.capture());

            assertThat(captor.getValue().getTitle()).contains("Weekly Challenge");
        }

        @Test
        @DisplayName("challenge is marked as public")
        void shouldBePublic() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<Challenge> captor = ArgumentCaptor.forClass(Challenge.class);
            verify(challengeRepository).save(captor.capture());

            assertThat(captor.getValue().getIsPublic()).isTrue();
        }

        @Test
        @DisplayName("challenge has 'weekly' tag")
        void shouldHaveWeeklyTag() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<Challenge> captor = ArgumentCaptor.forClass(Challenge.class);
            verify(challengeRepository).save(captor.capture());

            assertThat(captor.getValue().getTags()).contains("weekly");
        }

        @Test
        @DisplayName("challenge is created by system (createdBy = 0)")
        void shouldBeCreatedBySystem() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<Challenge> captor = ArgumentCaptor.forClass(Challenge.class);
            verify(challengeRepository).save(captor.capture());

            assertThat(captor.getValue().getCreatedBy()).isEqualTo(0L);
        }

        @Test
        @DisplayName("challenge has a time limit of 15 minutes")
        void shouldHave15MinuteTimeLimit() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<Challenge> captor = ArgumentCaptor.forClass(Challenge.class);
            verify(challengeRepository).save(captor.capture());

            assertThat(captor.getValue().getTimeLimit()).isEqualTo(15);
        }

        @Test
        @DisplayName("all questions have 20 points each")
        void questionsShouldHave20Points() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<List<Question>> captor = ArgumentCaptor.forClass(List.class);
            verify(questionRepository).saveAll(captor.capture());

            captor.getValue().forEach(q ->
                    assertThat(q.getPoints()).isEqualTo(20));
        }

        @Test
        @DisplayName("questions have sequential orderIndex 0–4")
        void questionsShouldHaveSequentialOrderIndex() {
            scheduler.createWeeklyChallenge();

            ArgumentCaptor<List<Question>> captor = ArgumentCaptor.forClass(List.class);
            verify(questionRepository).saveAll(captor.capture());

            List<Question> questions = captor.getValue();
            for (int i = 0; i < questions.size(); i++) {
                assertThat(questions.get(i).getOrderIndex()).isEqualTo(i);
            }
        }

        @Test
        @DisplayName("does not throw even when repository throws — logs error gracefully")
        void shouldHandleRepositoryException() {
            when(challengeRepository.save(any())).thenThrow(new RuntimeException("DB error"));

            // Should not propagate the exception
            assertThatCode(() -> scheduler.createWeeklyChallenge())
                    .doesNotThrowAnyException();
        }
    }
}
