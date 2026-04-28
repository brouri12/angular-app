package tn.esprit.challenge.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.challenge.dto.ChallengeDTO;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.SkillFocus;
import tn.esprit.challenge.repository.ChallengeRepository;
import tn.esprit.challenge.repository.QuestionRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChallengeService Unit Tests")
class ChallengeServiceTest {

    @Mock  ChallengeRepository challengeRepository;
    @Mock  QuestionRepository  questionRepository;
    @InjectMocks ChallengeService challengeService;

    // ── Fixtures ───────────────────────────────────────────────────────────────

    private Challenge activeChallenge;
    private Challenge expiredChallenge;

    @BeforeEach
    void setUp() {
        activeChallenge = new Challenge();
        activeChallenge.setId(1L);
        activeChallenge.setTitle("Grammar Basics");
        activeChallenge.setDescription("Test your grammar");
        activeChallenge.setType(ChallengeType.GRAMMAR);
        activeChallenge.setSkillFocus(SkillFocus.GRAMMAR);
        activeChallenge.setLevel(ProficiencyLevel.B1);
        activeChallenge.setCategory("Tenses");
        activeChallenge.setPoints(100);
        activeChallenge.setIsPublic(true);
        activeChallenge.setIsExpired(false);
        activeChallenge.setTotalAttempts(0);
        activeChallenge.setSuccessfulCompletions(0);
        activeChallenge.setAverageRating(0.0);

        expiredChallenge = new Challenge();
        expiredChallenge.setId(2L);
        expiredChallenge.setTitle("Old Weekly Challenge");
        expiredChallenge.setType(ChallengeType.VOCABULARY);
        expiredChallenge.setSkillFocus(SkillFocus.VOCABULARY);
        expiredChallenge.setLevel(ProficiencyLevel.A1);
        expiredChallenge.setCategory("Words");
        expiredChallenge.setPoints(50);
        expiredChallenge.setIsPublic(true);
        expiredChallenge.setIsExpired(true);
        expiredChallenge.setTotalAttempts(0);
        expiredChallenge.setSuccessfulCompletions(0);
        expiredChallenge.setAverageRating(0.0);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getAllChallenges
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getAllChallenges()")
    class GetAllChallenges {

        @Test
        @DisplayName("returns only non-expired challenges")
        void shouldReturnOnlyActiveChallenges() {
            when(challengeRepository.findAll())
                    .thenReturn(List.of(activeChallenge, expiredChallenge));

            List<ChallengeDTO> result = challengeService.getAllChallenges();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTitle()).isEqualTo("Grammar Basics");
        }

        @Test
        @DisplayName("returns empty list when all challenges are expired")
        void shouldReturnEmptyWhenAllExpired() {
            when(challengeRepository.findAll()).thenReturn(List.of(expiredChallenge));

            List<ChallengeDTO> result = challengeService.getAllChallenges();

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("returns empty list when no challenges exist")
        void shouldReturnEmptyWhenNoChallenges() {
            when(challengeRepository.findAll()).thenReturn(List.of());

            List<ChallengeDTO> result = challengeService.getAllChallenges();

            assertThat(result).isEmpty();
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getAllChallengesIncludingExpired
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getAllChallengesIncludingExpired()")
    class GetAllIncludingExpired {

        @Test
        @DisplayName("returns both active and expired challenges")
        void shouldReturnAll() {
            when(challengeRepository.findAll())
                    .thenReturn(List.of(activeChallenge, expiredChallenge));

            List<ChallengeDTO> result = challengeService.getAllChallengesIncludingExpired();

            assertThat(result).hasSize(2);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getChallengeById
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getChallengeById()")
    class GetChallengeById {

        @Test
        @DisplayName("returns challenge DTO when found")
        void shouldReturnChallengeWhenFound() {
            when(challengeRepository.findById(1L)).thenReturn(Optional.of(activeChallenge));

            ChallengeDTO result = challengeService.getChallengeById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getTitle()).isEqualTo("Grammar Basics");
        }

        @Test
        @DisplayName("throws RuntimeException when challenge not found")
        void shouldThrowWhenNotFound() {
            when(challengeRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> challengeService.getChallengeById(99L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("99");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getChallengesByLevel
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getChallengesByLevel()")
    class GetByLevel {

        @Test
        @DisplayName("returns challenges matching the given level")
        void shouldReturnChallengesForLevel() {
            when(challengeRepository.findByLevel(ProficiencyLevel.B1))
                    .thenReturn(List.of(activeChallenge));

            List<ChallengeDTO> result = challengeService.getChallengesByLevel(ProficiencyLevel.B1);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getLevel()).isEqualTo(ProficiencyLevel.B1);
        }

        @Test
        @DisplayName("returns empty list when no challenges at that level")
        void shouldReturnEmptyForUnknownLevel() {
            when(challengeRepository.findByLevel(ProficiencyLevel.C2)).thenReturn(List.of());

            List<ChallengeDTO> result = challengeService.getChallengesByLevel(ProficiencyLevel.C2);

            assertThat(result).isEmpty();
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getChallengesByType
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getChallengesByType()")
    class GetByType {

        @Test
        @DisplayName("returns challenges matching the given type")
        void shouldReturnChallengesForType() {
            when(challengeRepository.findByType(ChallengeType.GRAMMAR))
                    .thenReturn(List.of(activeChallenge));

            List<ChallengeDTO> result = challengeService.getChallengesByType(ChallengeType.GRAMMAR);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getType()).isEqualTo(ChallengeType.GRAMMAR);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // deleteChallenge
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("deleteChallenge()")
    class DeleteChallenge {

        @Test
        @DisplayName("calls repository deleteById with correct id")
        void shouldCallDeleteById() {
            doNothing().when(challengeRepository).deleteById(1L);

            challengeService.deleteChallenge(1L);

            verify(challengeRepository, times(1)).deleteById(1L);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // incrementAttempts
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("incrementAttempts()")
    class IncrementAttempts {

        @Test
        @DisplayName("increments totalAttempts by 1")
        void shouldIncrementAttempts() {
            activeChallenge.setTotalAttempts(5);
            when(challengeRepository.findById(1L)).thenReturn(Optional.of(activeChallenge));
            when(challengeRepository.save(any())).thenReturn(activeChallenge);

            challengeService.incrementAttempts(1L);

            assertThat(activeChallenge.getTotalAttempts()).isEqualTo(6);
            verify(challengeRepository).save(activeChallenge);
        }

        @Test
        @DisplayName("throws when challenge not found")
        void shouldThrowWhenNotFound() {
            when(challengeRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> challengeService.incrementAttempts(99L))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // incrementSuccessfulCompletions
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("incrementSuccessfulCompletions()")
    class IncrementSuccessful {

        @Test
        @DisplayName("increments successfulCompletions by 1")
        void shouldIncrementSuccessfulCompletions() {
            activeChallenge.setSuccessfulCompletions(3);
            when(challengeRepository.findById(1L)).thenReturn(Optional.of(activeChallenge));
            when(challengeRepository.save(any())).thenReturn(activeChallenge);

            challengeService.incrementSuccessfulCompletions(1L);

            assertThat(activeChallenge.getSuccessfulCompletions()).isEqualTo(4);
        }
    }
}
