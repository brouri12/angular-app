package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.GameDTO;
import org.example.dto.QuestionDTO;
import org.example.entity.Game;
import org.example.entity.Question;
import org.example.mapper.GameMapper;
import org.example.repository.GameRepository;
import org.example.repository.QuestionRepository;
import org.example.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;

    // ─── Public (player-facing) ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GameDTO> getAllGames() {
        return gameRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
            .map(g -> {
                var subs = submissionRepository.findByGameIdOrderBySubmittedAtDesc(g.getId());
                int totalAttempts = subs.size();

                // Accuracy = total correct answers / total questions answered across all submissions
                int totalCorrect = subs.stream()
                    .mapToInt(s -> s.getCorrectAnswers() != null ? s.getCorrectAnswers() : 0)
                    .sum();
                int totalAnswered = subs.stream()
                    .mapToInt(s -> s.getTotalQuestions() != null ? s.getTotalQuestions() : 0)
                    .sum();

                double accuracy = totalAnswered > 0 ? (totalCorrect * 100.0 / totalAnswered) : 0;

                return GameMapper.toDTOSummary(g, totalAttempts, accuracy);
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GameDTO getGameById(Long id) {
        Game game = gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found: " + id));
        return GameMapper.toDTO(game, false);
    }

    @Transactional(readOnly = true)
    public List<GameDTO> getGamesByType(String type) {
        return gameRepository.findByTypeAndIsActiveTrueOrderByCreatedAtDesc(type.toUpperCase()).stream()
            .map(GameMapper::toDTOSummary)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GameDTO> getGamesByDifficulty(String difficulty) {
        return gameRepository.findByDifficultyAndIsActiveTrueOrderByCreatedAtDesc(difficulty.toUpperCase()).stream()
            .map(GameMapper::toDTOSummary)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<GameDTO> getAllGamesAdmin() {
        return gameRepository.findAll().stream()
            .map(GameMapper::toDTOSummary)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GameDTO getGameByIdAdmin(Long id) {
        Game game = gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found: " + id));
        return GameMapper.toDTO(game, true);
    }

    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestions(Long gameId) {
        return questionRepository.findByGameIdOrderByOrderIndexAsc(gameId).stream()
            .map(q -> GameMapper.questionToDTO(q, true))
            .collect(Collectors.toList());
    }

    @Transactional
    public GameDTO createGame(GameDTO dto) {
        Game game = GameMapper.toEntity(dto);
        Game saved = gameRepository.save(game);

        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            for (int i = 0; i < dto.getQuestions().size(); i++) {
                Question q = GameMapper.questionToEntity(dto.getQuestions().get(i), saved);
                q.setOrderIndex(i);
                questionRepository.save(q);
            }
        }

        log.info("Created game: {}", saved.getTitle());
        return GameMapper.toDTO(gameRepository.findById(saved.getId()).get(), true);
    }

    @Transactional
    public GameDTO updateGame(Long id, GameDTO dto) {
        Game existing = gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found: " + id));

        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        if (dto.getType() != null) existing.setType(dto.getType().toUpperCase());
        if (dto.getDifficulty() != null) existing.setDifficulty(dto.getDifficulty().toUpperCase());
        if (dto.getIsActive() != null) existing.setIsActive(dto.getIsActive());

        Game updated = gameRepository.save(existing);
        log.info("Updated game: {}", updated.getTitle());
        return GameMapper.toDTO(updated, true);
    }

    @Transactional
    public void deleteGame(Long id) {
        gameRepository.deleteById(id);
        log.info("Deleted game id={}", id);
    }

    @Transactional
    public GameDTO toggleGame(Long id) {
        Game game = gameRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Game not found: " + id));
        game.setIsActive(!game.getIsActive());
        return GameMapper.toDTOSummary(gameRepository.save(game));
    }

    // ─── Question CRUD ────────────────────────────────────────────────────────

    @Transactional
    public QuestionDTO addQuestion(Long gameId, QuestionDTO dto) {
        Game game = gameRepository.findById(gameId)
            .orElseThrow(() -> new RuntimeException("Game not found: " + gameId));
        long count = questionRepository.countByGameId(gameId);
        Question q = GameMapper.questionToEntity(dto, game);
        q.setOrderIndex((int) count);
        Question saved = questionRepository.save(q);
        log.info("Added question to game id={}", gameId);
        return GameMapper.questionToDTO(saved, true);
    }

    @Transactional
    public QuestionDTO updateQuestion(Long questionId, QuestionDTO dto) {
        Question existing = questionRepository.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
        existing.setQuestionText(dto.getQuestionText());
        existing.setOptions(dto.getOptions() != null ? dto.getOptions() : new java.util.ArrayList<>());
        existing.setCorrectAnswer(dto.getCorrectAnswer());
        existing.setExplanation(dto.getExplanation());
        if (dto.getPoints() != null) existing.setPoints(dto.getPoints());
        return GameMapper.questionToDTO(questionRepository.save(existing), true);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        questionRepository.deleteById(questionId);
        log.info("Deleted question id={}", questionId);
    }
}
