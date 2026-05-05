package org.example.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dto.SubmissionRequest;
import org.example.dto.SubmissionResponse;
import org.example.service.SubmissionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for SubmissionController.
 *
 * Covers:
 * - POST /api/submissions → 201 with response body
 * - POST /api/submissions → 500 when game not found
 * - GET /api/submissions/{id} → 200
 * - GET /api/submissions/{id} → 500 when not found
 * - GET /api/submissions/user/{userId} → 200 with list
 */
@WebMvcTest(SubmissionController.class)
@ActiveProfiles("test")
class SubmissionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubmissionService submissionService;

    @Autowired
    private ObjectMapper objectMapper;

    private SubmissionResponse makeResponse(Long id, String status, int correct, int total, int score) {
        SubmissionResponse r = new SubmissionResponse();
        r.setId(id);
        r.setGameId(1L);
        r.setGameTitle("English Quiz");
        r.setUserId("user-1");
        r.setStatus(status);
        r.setCorrectAnswers(correct);
        r.setTotalQuestions(total);
        r.setScore(score);
        r.setPercentage(total > 0 ? (correct * 100.0 / total) : 0);
        r.setFeedback("Good job!");
        r.setPassed("PASSED".equals(status));
        return r;
    }

    // ─── POST /api/submissions ────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/submissions → 201 with submission response")
    void submit_validRequest_returns201() throws Exception {
        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "Paris", 2L, "4"));

        SubmissionResponse resp = makeResponse(1L, "PASSED", 2, 2, 20);
        when(submissionService.submit(any())).thenReturn(resp);

        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PASSED"))
                .andExpect(jsonPath("$.correctAnswers").value(2))
                .andExpect(jsonPath("$.score").value(20))
                .andExpect(jsonPath("$.passed").value(true))
                .andExpect(jsonPath("$.gameTitle").value("English Quiz"));
    }

    @Test
    @DisplayName("POST /api/submissions → 500 when game not found")
    void submit_gameNotFound_returns500() throws Exception {
        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(99L);
        req.setUserId("user-1");
        req.setAnswers(Map.of());

        when(submissionService.submit(any()))
                .thenThrow(new RuntimeException("Game not found: 99"));

        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("POST /api/submissions — FAILED status when all answers wrong")
    void submit_allWrong_returnsFailed() throws Exception {
        SubmissionRequest req = new SubmissionRequest();
        req.setGameId(1L);
        req.setUserId("user-1");
        req.setAnswers(Map.of(1L, "WRONG"));

        SubmissionResponse resp = makeResponse(1L, "FAILED", 0, 1, 0);
        when(submissionService.submit(any())).thenReturn(resp);

        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("FAILED"))
                .andExpect(jsonPath("$.passed").value(false))
                .andExpect(jsonPath("$.score").value(0));
    }

    // ─── GET /api/submissions/{id} ────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/submissions/{id} → 200 with submission")
    void getById_found_returns200() throws Exception {
        SubmissionResponse resp = makeResponse(5L, "PARTIAL", 1, 2, 10);
        when(submissionService.getById(5L)).thenReturn(resp);

        mockMvc.perform(get("/api/submissions/5").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.status").value("PARTIAL"));
    }

    @Test
    @DisplayName("GET /api/submissions/{id} → 500 when not found")
    void getById_notFound_returns500() throws Exception {
        when(submissionService.getById(999L))
                .thenThrow(new RuntimeException("Submission not found: 999"));

        mockMvc.perform(get("/api/submissions/999").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    // ─── GET /api/submissions/user/{userId} ───────────────────────────────────

    @Test
    @DisplayName("GET /api/submissions/user/{userId} → 200 with list")
    void getUserSubmissions_returns200() throws Exception {
        when(submissionService.getUserSubmissions("user-1")).thenReturn(List.of());

        mockMvc.perform(get("/api/submissions/user/user-1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
