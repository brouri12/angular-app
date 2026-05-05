package org.example.service;

import org.example.dto.SubmissionRequest;
import org.example.dto.SubmissionResponse;
import org.example.entity.Game;
import org.example.entity.PlayerSession;
import org.example.entity.Question;
import org.example.entity.Submission;
import org.example.repository.GameRepository;
import org.example.repository.QuestionRepository;
import org.example.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SubmissionService.
 *
 * Covers:
 * - Answer grading (correct / wrong / case-insensitive)
 * - Status determination: PASSED (>=70%), PARTIAL (50-69%), FAILED (<50%)
 * - Feedback message generation
 * - Crossword special path (gameId=0)
 * - Game not found exception
 * - Null userId defaults to "default-user"
 * - XP is awarded after every submission
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SubmissionServiceTest {

    @Mock private SubmissionRepository submissionRepository;
    @Mock private GameRepository gameRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private PlayerSessionService sessionService;

    @InjectMocks
    private SubmissionService service;

    private Game game;
    private Question q1, q2, q3;

    @BeforeEach
    void setUp() {
        game = new Game();
        game.setId(1L);
        game.setTitle("English Quiz");
        game.setType("QUIZ");
        game.setDifficulty("EASY");
        game.setIsActive(true);

        q1 = makeQuestion(1L, "What is 2+2?", "4", 10);
        q2 = makeQuestion(2L, "Capital of France?", "Paris", 10);
        q3 = makeQuestion(3L, "Color of sky?", "Blue", 10);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Question makeQuestion(Long id, String text, String answer, int points) {
        Question q = new Question();
        q.setId(id);
        q.setGame(game);
        q.setQuestionText(text);
        q.setCorrectAnswer(answer);
        q.setPoints(points);
        q.setOrderIndex(0);
        return q;
    }

    private Submission savedSubmission(Long gameId, String userId, int correct, int total, int score, String status) {
        Submission s = new Submission();
        s.setId(99L);
        s.setGameId(gameId);
        s.setUserId(userId);
        s.setCorrectAnswers(correct);
        s.setTotalQuestions(total);
        s.setScore(score);
        s.setStatus(status);
        s.setFeedback("feedback");
        return s;
    }

    private void mockGameAndQuestions(List<Question> questions) {
        when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
        when(questionRepository.findByGameIdOrderByOrderIndexAsc(1L)).thenReturn(questions);
        when(submissionRepository.save(any())).thenAnswer(inv -> {
            Submission s = inv.getArgument(0);
            s.setId(99L);
            return s;
        });
        when(sessionService.awardXP(anyString(), anyInt(), anyBoolean()))
                .thenReturn(PlayerSession.builder().userId("user-1").build());
        when(gameRepository.findById(anyLong())).thenReturn(Optional.of(game));
    }

    // ─── Status determination ─────────────────────────────────────────────────

    @Test
    @DisplayName("submit — all correct (100%) → status PASSED")
    void submit_allCorrect_statusPassed() {
        mockGameAndQuestions(List.of(q1, q2));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "4", 2L, "Paris"));

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getStatus()).isEqualTo("PASSED");
        assertThat(resp.getCorrectAnswers()).isEqualTo(2);
        assertThat(resp.getScore()).isEqualTo(20);
        assertThat(resp.getPassed()).isTrue();
    }

    @Test
    @DisplayName("submit — 70% correct → status PASSED")
    void submit_70percent_statusPassed() {
        mockGameAndQuestions(List.of(q1, q2, q3));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "4", 2L, "Paris", 3L, "WRONG"));

        SubmissionResponse resp = service.submit(req);

        // 2/3 = 66.6% → PARTIAL
        assertThat(resp.getStatus()).isEqualTo("PARTIAL");
    }

    @Test
    @DisplayName("submit — exactly 70% (7/10 questions) → status PASSED")
    void submit_exactly70percent_statusPassed() {
        List<Question> questions = List.of(
            makeQuestion(1L, "Q1", "A", 10), makeQuestion(2L, "Q2", "B", 10),
            makeQuestion(3L, "Q3", "C", 10), makeQuestion(4L, "Q4", "D", 10),
            makeQuestion(5L, "Q5", "E", 10), makeQuestion(6L, "Q6", "F", 10),
            makeQuestion(7L, "Q7", "G", 10), makeQuestion(8L, "Q8", "H", 10),
            makeQuestion(9L, "Q9", "I", 10), makeQuestion(10L, "Q10", "J", 10)
        );
        when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
        when(questionRepository.findByGameIdOrderByOrderIndexAsc(1L)).thenReturn(questions);
        when(submissionRepository.save(any())).thenAnswer(inv -> { Submission s = inv.getArgument(0); s.setId(1L); return s; });
        when(sessionService.awardXP(anyString(), anyInt(), anyBoolean())).thenReturn(PlayerSession.builder().userId("u").build());
        when(gameRepository.findById(anyLong())).thenReturn(Optional.of(game));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L,"A",2L,"B",3L,"C",4L,"D",5L,"E",6L,"F",7L,"G",8L,"X",9L,"X",10L,"X"));

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getStatus()).isEqualTo("PASSED");
    }

    @Test
    @DisplayName("submit — 50% correct → status PARTIAL")
    void submit_50percent_statusPartial() {
        mockGameAndQuestions(List.of(q1, q2));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "4", 2L, "WRONG"));

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getStatus()).isEqualTo("PARTIAL");
    }

    @Test
    @DisplayName("submit — 0% correct → status FAILED")
    void submit_allWrong_statusFailed() {
        mockGameAndQuestions(List.of(q1, q2));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "WRONG", 2L, "WRONG"));

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getStatus()).isEqualTo("FAILED");
        assertThat(resp.getCorrectAnswers()).isEqualTo(0);
        assertThat(resp.getScore()).isEqualTo(0);
        assertThat(resp.getPassed()).isFalse();
    }

    // ─── Answer grading ───────────────────────────────────────────────────────

    @Test
    @DisplayName("submit — answer matching is case-insensitive")
    void submit_caseInsensitiveMatching() {
        mockGameAndQuestions(List.of(q2)); // correct = "Paris"

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(2L, "paris")); // lowercase

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getCorrectAnswers()).isEqualTo(1);
        assertThat(resp.getStatus()).isEqualTo("PASSED");
    }

    @Test
    @DisplayName("submit — whitespace-trimmed answer is accepted")
    void submit_trimmedAnswer_accepted() {
        mockGameAndQuestions(List.of(q1)); // correct = "4"

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "  4  "));

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getCorrectAnswers()).isEqualTo(1);
    }

    @Test
    @DisplayName("submit — null answer counts as wrong")
    void submit_nullAnswer_countsAsWrong() {
        mockGameAndQuestions(List.of(q1));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of()); // no answer for q1

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getCorrectAnswers()).isEqualTo(0);
    }

    // ─── Null userId defaults ─────────────────────────────────────────────────

    @Test
    @DisplayName("submit — null userId defaults to 'default-user'")
    void submit_nullUserId_defaultsToDefaultUser() {
        mockGameAndQuestions(List.of(q1));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId(null);
        req.setAnswers(Map.of(1L, "4"));

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getUserId()).isEqualTo("default-user");
    }

    // ─── Game not found ───────────────────────────────────────────────────────

    @Test
    @DisplayName("submit — throws RuntimeException when game not found")
    void submit_gameNotFound_throwsException() {
        when(gameRepository.findById(99L)).thenReturn(Optional.empty());

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(99L);
        req.setUserId("user-1");
        req.setAnswers(Map.of());

        assertThatThrownBy(() -> service.submit(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Game not found: 99");

        verify(submissionRepository, never()).save(any());
    }

    // ─── Crossword special path (gameId=0) ────────────────────────────────────

    @Test
    @DisplayName("submit — crossword (gameId=0) uses override values, skips game lookup")
    void submit_crossword_usesOverrides() {
        when(submissionRepository.save(any())).thenAnswer(inv -> { Submission s = inv.getArgument(0); s.setId(1L); return s; });
        when(sessionService.awardXP(anyString(), anyInt(), anyBoolean())).thenReturn(PlayerSession.builder().userId("u").build());
        when(gameRepository.findById(0L)).thenReturn(Optional.empty()); // crossword has no DB entry

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(0L);
        req.setUserId("user-1");
        req.setAnswers(Map.of());
        req.setScoreOverride(50);
        req.setCorrectOverride(5);
        req.setTotalOverride(10);

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getScore()).isEqualTo(50);
        assertThat(resp.getCorrectAnswers()).isEqualTo(5);
        assertThat(resp.getTotalQuestions()).isEqualTo(10);
        assertThat(resp.getGameTitle()).isEqualTo("Crossword"); // gameId=0 → "Crossword"
        // questions are never fetched for crossword
        verify(questionRepository, never()).findByGameIdOrderByOrderIndexAsc(anyLong());
    }

    // ─── XP is always awarded ─────────────────────────────────────────────────

    @Test
    @DisplayName("submit — awardXP is called once after every submission")
    void submit_alwaysAwardsXP() {
        mockGameAndQuestions(List.of(q1));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "4"));

        service.submit(req);

        verify(sessionService, times(1)).awardXP(eq("user-1"), anyInt(), anyBoolean());
    }

    // ─── Feedback messages ────────────────────────────────────────────────────

    @Test
    @DisplayName("submit — feedback contains 'Excellent' when accuracy >= 90%")
    void submit_highAccuracy_excellentFeedback() {
        mockGameAndQuestions(List.of(q1, q2, q3));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "4", 2L, "Paris", 3L, "Blue")); // 100%

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getFeedback()).containsIgnoringCase("Excellent");
    }

    @Test
    @DisplayName("submit — feedback contains 'Good job' when accuracy 70-89%")
    void submit_goodAccuracy_goodJobFeedback() {
        // 2/2 = 100% with 2 questions, need 70-89% → use 7/10 scenario
        List<Question> questions = List.of(
            makeQuestion(1L,"Q1","A",10), makeQuestion(2L,"Q2","B",10),
            makeQuestion(3L,"Q3","C",10), makeQuestion(4L,"Q4","D",10),
            makeQuestion(5L,"Q5","E",10), makeQuestion(6L,"Q6","F",10),
            makeQuestion(7L,"Q7","G",10), makeQuestion(8L,"Q8","H",10),
            makeQuestion(9L,"Q9","I",10), makeQuestion(10L,"Q10","J",10)
        );
        when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
        when(questionRepository.findByGameIdOrderByOrderIndexAsc(1L)).thenReturn(questions);
        when(submissionRepository.save(any())).thenAnswer(inv -> { Submission s = inv.getArgument(0); s.setId(1L); return s; });
        when(sessionService.awardXP(anyString(), anyInt(), anyBoolean())).thenReturn(PlayerSession.builder().userId("u").build());
        when(gameRepository.findById(anyLong())).thenReturn(Optional.of(game));

        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        // 8/10 = 80%
        req.setAnswers(Map.of(1L,"A",2L,"B",3L,"C",4L,"D",5L,"E",6L,"F",7L,"G",8L,"H",9L,"X",10L,"X"));

        SubmissionResponse resp = service.submit(req);

        assertThat(resp.getFeedback()).containsIgnoringCase("Good job");
    }

    // ─── getById ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getById — throws RuntimeException when submission not found")
    void getById_notFound_throwsException() {
        when(submissionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Submission not found: 999");
    }
}
