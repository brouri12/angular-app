package org.example.mapper;

import org.example.dto.GameDTO;
import org.example.dto.QuestionDTO;
import org.example.entity.Game;
import org.example.entity.Question;

import java.util.stream.Collectors;

public class GameMapper {

    /** Map Game to DTO. includeAnswers=false for players, true for admin. */
    public static GameDTO toDTO(Game game, boolean includeAnswers) {
        if (game == null) return null;

        GameDTO dto = new GameDTO();
        dto.setId(game.getId());
        dto.setTitle(game.getTitle());
        dto.setDescription(game.getDescription());
        dto.setType(game.getType());
        dto.setDifficulty(game.getDifficulty());
        dto.setIsActive(game.getIsActive());
        dto.setCreatedAt(game.getCreatedAt());
        dto.setQuestionCount((long) game.getQuestions().size());

        if (game.getQuestions() != null) {
            dto.setQuestions(game.getQuestions().stream()
                .map(q -> questionToDTO(q, includeAnswers))
                .collect(Collectors.toList()));
        }

        return dto;
    }

    /** List view — no questions embedded, just metadata + stats */
    public static GameDTO toDTOSummary(Game game, int totalAttempts, double successRate) {
        if (game == null) return null;

        GameDTO dto = new GameDTO();
        dto.setId(game.getId());
        dto.setTitle(game.getTitle());
        dto.setDescription(game.getDescription());
        dto.setType(game.getType());
        dto.setDifficulty(game.getDifficulty());
        dto.setIsActive(game.getIsActive());
        dto.setCreatedAt(game.getCreatedAt());
        dto.setQuestionCount((long) game.getQuestions().size());
        dto.setTotalAttempts(totalAttempts);
        dto.setSuccessRate(Math.round(successRate * 10.0) / 10.0);
        return dto;
    }

    /** List view — no questions, no stats */
    public static GameDTO toDTOSummary(Game game) {
        return toDTOSummary(game, 0, 0.0);
    }

    public static QuestionDTO questionToDTO(Question q, boolean includeAnswer) {
        if (q == null) return null;

        QuestionDTO dto = new QuestionDTO();
        dto.setId(q.getId());
        dto.setQuestionText(q.getQuestionText());
        dto.setOptions(q.getOptions());
        dto.setExplanation(q.getExplanation());
        dto.setPoints(q.getPoints());
        dto.setOrderIndex(q.getOrderIndex());

        if (includeAnswer) {
            dto.setCorrectAnswer(q.getCorrectAnswer());
        }

        return dto;
    }

    public static Game toEntity(GameDTO dto) {
        if (dto == null) return null;

        Game game = new Game();
        game.setId(dto.getId());
        game.setTitle(dto.getTitle());
        game.setDescription(dto.getDescription());
        game.setType(dto.getType() != null ? dto.getType().toUpperCase() : "QUIZ");
        game.setDifficulty(dto.getDifficulty() != null ? dto.getDifficulty().toUpperCase() : "EASY");
        game.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return game;
    }

    public static Question questionToEntity(QuestionDTO dto, Game game) {
        if (dto == null) return null;

        Question q = new Question();
        q.setId(dto.getId());
        q.setGame(game);
        q.setQuestionText(dto.getQuestionText());
        q.setOptions(dto.getOptions() != null ? dto.getOptions() : new java.util.ArrayList<>());
        q.setCorrectAnswer(dto.getCorrectAnswer());
        q.setExplanation(dto.getExplanation());
        q.setPoints(dto.getPoints() != null ? dto.getPoints() : 10);
        q.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0);
        return q;
    }
}
