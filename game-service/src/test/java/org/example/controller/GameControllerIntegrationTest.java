package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dto.GameDTO;
import org.example.service.GameService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for GameController (slice test — no DB needed).
 *
 * Covers:
 * - GET /api/games → 200 + JSON array
 * - GET /api/games/{id} → 200 + game JSON
 * - GET /api/games/{id} → 500 when service throws (game not found)
 * - GET /api/games?type=QUIZ → filtered list
 * - GET /api/games?difficulty=EASY → filtered list
 */
@WebMvcTest(GameController.class)
@ActiveProfiles("test")
class GameControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameService gameService;

    @Autowired
    private ObjectMapper objectMapper;

    private GameDTO makeGameDTO(Long id, String title, String type, String difficulty) {
        GameDTO dto = new GameDTO();
        dto.setId(id);
        dto.setTitle(title);
        dto.setType(type);
        dto.setDifficulty(difficulty);
        dto.setIsActive(true);
        dto.setQuestionCount(5L);
        dto.setTotalAttempts(10);
        dto.setSuccessRate(75.0);
        return dto;
    }

    // ─── GET /api/games ───────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/games → 200 with list of games")
    void getAllGames_returns200WithList() throws Exception {
        when(gameService.getAllGames()).thenReturn(List.of(
            makeGameDTO(1L, "English Quiz", "QUIZ", "EASY"),
            makeGameDTO(2L, "Sentence Builder", "SENTENCE", "MEDIUM")
        ));

        mockMvc.perform(get("/api/games").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("English Quiz"))
                .andExpect(jsonPath("$[0].type").value("QUIZ"))
                .andExpect(jsonPath("$[1].title").value("Sentence Builder"));
    }

    @Test
    @DisplayName("GET /api/games → 200 with empty list when no games")
    void getAllGames_emptyList_returns200() throws Exception {
        when(gameService.getAllGames()).thenReturn(List.of());

        mockMvc.perform(get("/api/games").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ─── GET /api/games/{id} ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/games/{id} → 200 with game details")
    void getGameById_found_returns200() throws Exception {
        GameDTO dto = makeGameDTO(1L, "English Quiz", "QUIZ", "EASY");
        when(gameService.getGameById(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/games/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("English Quiz"))
                .andExpect(jsonPath("$.type").value("QUIZ"))
                .andExpect(jsonPath("$.difficulty").value("EASY"))
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("GET /api/games/{id} → 500 when game not found (service throws)")
    void getGameById_notFound_returns500() throws Exception {
        when(gameService.getGameById(99L)).thenThrow(new RuntimeException("Game not found: 99"));

        mockMvc.perform(get("/api/games/99").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    // ─── GET /api/games?type=QUIZ ─────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/games?type=QUIZ → 200 with filtered list")
    void getByType_returnsFilteredList() throws Exception {
        when(gameService.getGamesByType("QUIZ")).thenReturn(List.of(
            makeGameDTO(1L, "Quiz 1", "QUIZ", "EASY")
        ));

        mockMvc.perform(get("/api/games").param("type", "QUIZ").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].type").value("QUIZ"));
    }

    // ─── GET /api/games?difficulty=EASY ──────────────────────────────────────

    @Test
    @DisplayName("GET /api/games?difficulty=EASY → 200 with filtered list")
    void getByDifficulty_returnsFilteredList() throws Exception {
        when(gameService.getGamesByDifficulty("EASY")).thenReturn(List.of(
            makeGameDTO(1L, "Easy Quiz", "QUIZ", "EASY")
        ));

        mockMvc.perform(get("/api/games").param("difficulty", "EASY").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].difficulty").value("EASY"));
    }
}
