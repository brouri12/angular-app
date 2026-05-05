package org.example.controller;

import org.example.dto.GlobalStatsDTO;
import org.example.dto.UserRankDTO;
import org.example.dto.UserStatsDTO;
import org.example.service.StatisticsService;
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
 * Integration tests for StatisticsController.
 *
 * Covers:
 * - GET /api/stats/users/{userId} → 200 with user stats
 * - GET /api/stats/global → 200 with global stats
 * - GET /api/stats/leaderboard → 200 with ranked list
 * - GET /api/stats/leaderboard?limit=3 → respects limit
 */
@WebMvcTest(StatisticsController.class)
@ActiveProfiles("test")
class StatisticsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatisticsService statisticsService;

    // ─── GET /api/stats/users/{userId} ────────────────────────────────────────

    @Test
    @DisplayName("GET /api/stats/users/{userId} → 200 with user stats")
    void getUserStats_returns200() throws Exception {
        UserStatsDTO dto = UserStatsDTO.builder()
                .userId("user-1")
                .totalGamesPlayed(10)
                .totalGamesPassed(7)
                .totalGamesFailed(3)
                .passRate(70.0)
                .overallAccuracy(75.5)
                .level(3)
                .totalXP(250)
                .progressBar(50)
                .currentStreak(2)
                .bestStreak(5)
                .build();

        when(statisticsService.getUserStats("user-1")).thenReturn(dto);

        mockMvc.perform(get("/api/stats/users/user-1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("user-1"))
                .andExpect(jsonPath("$.totalGamesPlayed").value(10))
                .andExpect(jsonPath("$.passRate").value(70.0))
                .andExpect(jsonPath("$.level").value(3))
                .andExpect(jsonPath("$.totalXP").value(250));
    }

    // ─── GET /api/stats/global ────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/stats/global → 200 with global stats")
    void getGlobalStats_returns200() throws Exception {
        GlobalStatsDTO dto = GlobalStatsDTO.builder()
                .totalGames(5L)
                .totalSubmissions(100L)
                .totalPlayers(20L)
                .globalPassRate(65.0)
                .globalAverageScore(72.3)
                .leaderboard(List.of())
                .build();

        when(statisticsService.getGlobalStats()).thenReturn(dto);

        mockMvc.perform(get("/api/stats/global").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGames").value(5))
                .andExpect(jsonPath("$.totalSubmissions").value(100))
                .andExpect(jsonPath("$.totalPlayers").value(20))
                .andExpect(jsonPath("$.globalPassRate").value(65.0));
    }

    // ─── GET /api/stats/leaderboard ───────────────────────────────────────────

    @Test
    @DisplayName("GET /api/stats/leaderboard → 200 with ranked list")
    void getLeaderboard_returns200() throws Exception {
        List<UserRankDTO> leaderboard = List.of(
            UserRankDTO.builder().rank(1).userId("alice").totalScore(500).level(6).winStreak(3).passRate(80.0).build(),
            UserRankDTO.builder().rank(2).userId("bob").totalScore(300).level(4).winStreak(1).passRate(60.0).build()
        );

        when(statisticsService.getLeaderboard(10)).thenReturn(leaderboard);

        mockMvc.perform(get("/api/stats/leaderboard").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[0].userId").value("alice"))
                .andExpect(jsonPath("$[0].totalScore").value(500))
                .andExpect(jsonPath("$[1].userId").value("bob"));
    }

    @Test
    @DisplayName("GET /api/stats/leaderboard?limit=3 → passes limit to service")
    void getLeaderboard_withLimit_passesLimitToService() throws Exception {
        when(statisticsService.getLeaderboard(3)).thenReturn(List.of());

        mockMvc.perform(get("/api/stats/leaderboard").param("limit", "3")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(statisticsService, times(1)).getLeaderboard(3);
    }
}
