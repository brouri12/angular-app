package org.example.service;

import org.example.dto.GameDTO;
import org.example.dto.QuestionDTO;
import org.example.entity.Game;
import org.example.entity.Question;
import org.example.repository.GameRepository;
import org.example.repository.QuestionRepository;
import org.example.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for GameService.
 *
 * Covers:
 * - getAllGames: only active games returned, accuracy calculation
 * - getGameById: found vs not found
 * - createGame: entity saved, questions saved
 * - updateGame: fields updated correctly
 * - deleteGame: repository called
 * - toggleGame: isActive flipped
 * - addQuestion: orderIndex set to count
 * - getGamesByType / getGamesByDifficulty: uppercase normalization
 */
@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock private GameRepository gameRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private SubmissionRepository submissionRepository;

    @InjectMocks
    private GameService service;

    private Game activeGame;

    @BeforeEach
    void setUp() {
        activeGame = new Game();
        activeGame.setId(1L);
        activeGame.setTitle("English Quiz");
        activeGame.setDescription("Test your English");
        activeGame.setType("QUIZ");
        activeGame.setDifficulty("EASY");
        activeGame.setIsActive(true);
        activeGame.setCreatedAt(LocalDateTime.now());
        activeGame.setQuestions(new ArrayList<>());
    }

    // ─── getAllGames ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllGames — returns only active games")
    void getAllGames_returnsActiveGames() {
        when(gameRepository.findByIsActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(activeGame));
        when(submissionRepository.findByGameIdOrderBySubmittedAtDesc(1L)).thenReturn(List.of());

        List<GameDTO> result = service.getAllGames();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("English Quiz");
    }

    @Test
    @DisplayName("getAllGames — returns empty list when no active games")
    void getAllGames_noActiveGames_returnsEmpty() {
        when(gameRepository.findByIsActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of());

        List<GameDTO> result = service.getAllGames();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getAllGames — successRate is 0 when no submissions")
    void getAllGames_noSubmissions_successRateZero() {
        when(gameRepository.findByIsActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(activeGame));
        when(submissionRepository.findByGameIdOrderBySubmittedAtDesc(1L)).thenReturn(List.of());

        List<GameDTO> result = service.getAllGames();

        assertThat(result.get(0).getSuccessRate()).isEqualTo(0.0);
        assertThat(result.get(0).getTotalAttempts()).isEqualTo(0);
    }

    // ─── getGameById ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getGameById — returns game DTO when found")
    void getGameById_found_returnsDTO() {
        when(gameRepository.findById(1L)).thenReturn(Optional.of(activeGame));

        GameDTO result = service.getGameById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("English Quiz");
    }

    @Test
    @DisplayName("getGameById — throws RuntimeException when not found")
    void getGameById_notFound_throwsException() {
        when(gameRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getGameById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Game not found: 99");
    }

    // ─── createGame ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("createGame — saves game and returns DTO with id")
    void createGame_savesAndReturns() {
        GameDTO dto = new GameDTO();
        dto.setTitle("New Game");
        dto.setType("quiz");
        dto.setDifficulty("medium");
        dto.setIsActive(true);

        when(gameRepository.save(any())).thenAnswer(inv -> {
            Game g = inv.getArgument(0);
            g.setId(5L);
            g.setCreatedAt(LocalDateTime.now());
            g.setQuestions(new ArrayList<>());
            return g;
        });
        when(gameRepository.findById(5L)).thenReturn(Optional.of(activeGame));

        GameDTO result = service.createGame(dto);

        verify(gameRepository, times(1)).save(any(Game.class));
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("createGame — type and difficulty are uppercased")
    void createGame_uppercasesTypeAndDifficulty() {
        GameDTO dto = new GameDTO();
        dto.setTitle("Test");
        dto.setType("quiz");
        dto.setDifficulty("easy");

        when(gameRepository.save(any())).thenAnswer(inv -> {
            Game g = inv.getArgument(0);
            g.setId(1L);
            g.setCreatedAt(LocalDateTime.now());
            g.setQuestions(new ArrayList<>());
            return g;
        });
        when(gameRepository.findById(anyLong())).thenReturn(Optional.of(activeGame));

        service.createGame(dto);

        verify(gameRepository).save(argThat(g ->
            "QUIZ".equals(g.getType()) && "EASY".equals(g.getDifficulty())
        ));
    }

    @Test
    @DisplayName("createGame — saves questions when provided")
    void createGame_withQuestions_savesQuestions() {
        QuestionDTO qDto = new QuestionDTO();
        qDto.setQuestionText("What is 2+2?");
        qDto.setCorrectAnswer("4");
        qDto.setPoints(10);

        GameDTO dto = new GameDTO();
        dto.setTitle("Quiz");
        dto.setType("QUIZ");
        dto.setDifficulty("EASY");
        dto.setQuestions(List.of(qDto));

        when(gameRepository.save(any())).thenAnswer(inv -> {
            Game g = inv.getArgument(0);
            g.setId(1L);
            g.setCreatedAt(LocalDateTime.now());
            g.setQuestions(new ArrayList<>());
            return g;
        });
        when(questionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(gameRepository.findById(anyLong())).thenReturn(Optional.of(activeGame));

        service.createGame(dto);

        verify(questionRepository, times(1)).save(any(Question.class));
    }

    // ─── updateGame ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateGame — updates title, type, difficulty")
    void updateGame_updatesFields() {
        when(gameRepository.findById(1L)).thenReturn(Optional.of(activeGame));
        when(gameRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        GameDTO dto = new GameDTO();
        dto.setTitle("Updated Title");
        dto.setType("sentence");
        dto.setDifficulty("hard");
        dto.setIsActive(false);

        GameDTO result = service.updateGame(1L, dto);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        verify(gameRepository, times(1)).save(argThat(g ->
            "Updated Title".equals(g.getTitle()) &&
            "SENTENCE".equals(g.getType()) &&
            "HARD".equals(g.getDifficulty()) &&
            !g.getIsActive()
        ));
    }

    @Test
    @DisplayName("updateGame — throws RuntimeException when game not found")
    void updateGame_notFound_throwsException() {
        when(gameRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateGame(99L, new GameDTO()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Game not found: 99");
    }

    // ─── deleteGame ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteGame — calls deleteById on repository")
    void deleteGame_callsRepository() {
        doNothing().when(gameRepository).deleteById(1L);

        service.deleteGame(1L);

        verify(gameRepository, times(1)).deleteById(1L);
    }

    // ─── toggleGame ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("toggleGame — flips isActive from true to false")
    void toggleGame_trueToFalse() {
        activeGame.setIsActive(true);
        when(gameRepository.findById(1L)).thenReturn(Optional.of(activeGame));
        when(gameRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        GameDTO result = service.toggleGame(1L);

        assertThat(result.getIsActive()).isFalse();
    }

    @Test
    @DisplayName("toggleGame — flips isActive from false to true")
    void toggleGame_falseToTrue() {
        activeGame.setIsActive(false);
        when(gameRepository.findById(1L)).thenReturn(Optional.of(activeGame));
        when(gameRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        GameDTO result = service.toggleGame(1L);

        assertThat(result.getIsActive()).isTrue();
    }

    // ─── addQuestion ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("addQuestion — sets orderIndex to current question count")
    void addQuestion_setsOrderIndex() {
        when(gameRepository.findById(1L)).thenReturn(Optional.of(activeGame));
        when(questionRepository.countByGameId(1L)).thenReturn(3L);
        when(questionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        QuestionDTO dto = new QuestionDTO();
        dto.setQuestionText("New question?");
        dto.setCorrectAnswer("Answer");
        dto.setPoints(10);

        service.addQuestion(1L, dto);

        verify(questionRepository).save(argThat(q -> q.getOrderIndex() == 3));
    }

    // ─── getGamesByType ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getGamesByType — normalizes type to uppercase before querying")
    void getGamesByType_uppercasesType() {
        when(gameRepository.findByTypeAndIsActiveTrueOrderByCreatedAtDesc("QUIZ"))
                .thenReturn(List.of(activeGame));

        List<GameDTO> result = service.getGamesByType("quiz");

        assertThat(result).hasSize(1);
        verify(gameRepository).findByTypeAndIsActiveTrueOrderByCreatedAtDesc("QUIZ");
    }

    // ─── getGamesByDifficulty ─────────────────────────────────────────────────

    @Test
    @DisplayName("getGamesByDifficulty — normalizes difficulty to uppercase")
    void getGamesByDifficulty_uppercasesDifficulty() {
        when(gameRepository.findByDifficultyAndIsActiveTrueOrderByCreatedAtDesc("HARD"))
                .thenReturn(List.of(activeGame));

        List<GameDTO> result = service.getGamesByDifficulty("hard");

        assertThat(result).hasSize(1);
        verify(gameRepository).findByDifficultyAndIsActiveTrueOrderByCreatedAtDesc("HARD");
    }
}
