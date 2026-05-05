package org.example.controller;

import org.example.entity.PlayerSession;
import org.example.service.PlayerSessionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for PlayerSessionController.
 *
 * Covers:
 * - GET /api/session → 200 with default-user session
 * - GET /api/session/{userId} → 200 with specific user session
 * - POST /api/session/{userId}/reset → 200 with reset session
 */
@WebMvcTest(PlayerSessionController.class)
@ActiveProfiles("test")
class PlayerSessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlayerSessionService sessionService;

    private PlayerSession makeSession(String userId, int xp, int level) {
        return PlayerSession.builder()
                .userId(userId)
                .totalXP(xp)
                .level(level)
                .progressBar(xp % 100)
                .gamesWon(3)
                .winStreak(2)
                .bestStreak(5)
                .build();
    }

    @Test
    @DisplayName("GET /api/session → 200 with default-user session")
    void getSession_returnsDefaultUser() throws Exception {
        when(sessionService.getOrCreate("default-user"))
                .thenReturn(makeSession("default-user", 150, 2));

        mockMvc.perform(get("/api/session").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("default-user"))
                .andExpect(jsonPath("$.totalXP").value(150))
                .andExpect(jsonPath("$.level").value(2));
    }

    @Test
    @DisplayName("GET /api/session/{userId} → 200 with specific user session")
    void getSessionByUser_returnsCorrectUser() throws Exception {
        when(sessionService.getOrCreate("alice"))
                .thenReturn(makeSession("alice", 300, 4));

        mockMvc.perform(get("/api/session/alice").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("alice"))
                .andExpect(jsonPath("$.level").value(4));
    }

    @Test
    @DisplayName("POST /api/session/{userId}/reset → 200 with zeroed session")
    void resetSession_returns200WithResetSession() throws Exception {
        PlayerSession reset = makeSession("user-1", 0, 1);
        reset.setGamesWon(0);
        reset.setWinStreak(0);
        when(sessionService.resetSession("user-1")).thenReturn(reset);

        mockMvc.perform(post("/api/session/user-1/reset").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalXP").value(0))
                .andExpect(jsonPath("$.level").value(1))
                .andExpect(jsonPath("$.gamesWon").value(0));

        verify(sessionService, times(1)).resetSession("user-1");
    }
}
