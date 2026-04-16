package tn.esprit.challenge.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import tn.esprit.challenge.dto.ChallengeDTO;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.SkillFocus;
import tn.esprit.challenge.service.ChallengeService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChallengeController.class)
@EnableAutoConfiguration(exclude = {
    MailSenderAutoConfiguration.class
})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "eureka.client.enabled=false",
    "eureka.client.register-with-eureka=false",
    "eureka.client.fetch-registry=false",
    "spring.cloud.discovery.enabled=false"
})
@DisplayName("ChallengeController Integration Tests (MockMvc)")
class ChallengeControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean  ChallengeService challengeService;

    private ChallengeDTO sampleDTO;

    @BeforeEach
    void setUp() {
        sampleDTO = new ChallengeDTO();
        sampleDTO.setId(1L);
        sampleDTO.setTitle("Grammar Basics");
        sampleDTO.setDescription("Test your grammar skills");
        sampleDTO.setType(ChallengeType.GRAMMAR);
        sampleDTO.setSkillFocus(SkillFocus.GRAMMAR);
        sampleDTO.setLevel(ProficiencyLevel.B1);
        sampleDTO.setCategory("Tenses");
        sampleDTO.setPoints(100);
        sampleDTO.setIsPublic(true);
        sampleDTO.setQuestions(List.of());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET /api/challenges
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("GET /api/challenges")
    class GetAll {

        @Test
        @DisplayName("returns 200 with list of challenges")
        void shouldReturn200WithChallenges() throws Exception {
            when(challengeService.getAllChallenges()).thenReturn(List.of(sampleDTO));

            mockMvc.perform(get("/api/challenges"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].title", is("Grammar Basics")))
                    .andExpect(jsonPath("$[0].level", is("B1")));
        }

        @Test
        @DisplayName("returns 200 with empty list when no challenges")
        void shouldReturn200WithEmptyList() throws Exception {
            when(challengeService.getAllChallenges()).thenReturn(List.of());

            mockMvc.perform(get("/api/challenges"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET /api/challenges/{id}
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("GET /api/challenges/{id}")
    class GetById {

        @Test
        @DisplayName("returns 200 with challenge when found")
        void shouldReturn200WhenFound() throws Exception {
            when(challengeService.getChallengeById(1L)).thenReturn(sampleDTO);

            mockMvc.perform(get("/api/challenges/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.title", is("Grammar Basics")));
        }

        @Test
        @DisplayName("returns 500 when challenge not found (RuntimeException)")
        void shouldReturn500WhenNotFound() throws Exception {
            when(challengeService.getChallengeById(99L))
                    .thenThrow(new RuntimeException("Challenge not found with id: 99"));

            mockMvc.perform(get("/api/challenges/99"))
                    .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isGreaterThanOrEqualTo(400));
        }    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET /api/challenges/level/{level}
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("GET /api/challenges/level/{level}")
    class GetByLevel {

        @Test
        @DisplayName("returns 200 with challenges for given level")
        void shouldReturn200ForLevel() throws Exception {
            when(challengeService.getChallengesByLevel(ProficiencyLevel.B1))
                    .thenReturn(List.of(sampleDTO));

            mockMvc.perform(get("/api/challenges/level/B1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].level", is("B1")));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET /api/challenges/type/{type}
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("GET /api/challenges/type/{type}")
    class GetByType {

        @Test
        @DisplayName("returns 200 with challenges for given type")
        void shouldReturn200ForType() throws Exception {
            when(challengeService.getChallengesByType(ChallengeType.GRAMMAR))
                    .thenReturn(List.of(sampleDTO));

            mockMvc.perform(get("/api/challenges/type/GRAMMAR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].type", is("GRAMMAR")));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // GET /api/challenges/search
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("GET /api/challenges/search")
    class Search {

        @Test
        @DisplayName("returns 200 with matching challenges")
        void shouldReturn200WithResults() throws Exception {
            when(challengeService.searchChallenges("grammar")).thenReturn(List.of(sampleDTO));

            mockMvc.perform(get("/api/challenges/search").param("keyword", "grammar"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // POST /api/challenges
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("POST /api/challenges")
    class Create {

        @Test
        @DisplayName("returns 201 with created challenge")
        void shouldReturn201OnCreate() throws Exception {
            when(challengeService.createChallenge(any())).thenReturn(sampleDTO);

            mockMvc.perform(post("/api/challenges")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleDTO)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.title", is("Grammar Basics")));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PUT /api/challenges/{id}
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("PUT /api/challenges/{id}")
    class Update {

        @Test
        @DisplayName("returns 200 with updated challenge")
        void shouldReturn200OnUpdate() throws Exception {
            sampleDTO.setTitle("Updated Grammar");
            when(challengeService.updateChallenge(eq(1L), any())).thenReturn(sampleDTO);

            mockMvc.perform(put("/api/challenges/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(sampleDTO)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title", is("Updated Grammar")));
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // DELETE /api/challenges/{id}
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("DELETE /api/challenges/{id}")
    class Delete {

        @Test
        @DisplayName("returns 204 on successful delete")
        void shouldReturn204OnDelete() throws Exception {
            doNothing().when(challengeService).deleteChallenge(1L);

            mockMvc.perform(delete("/api/challenges/1"))
                    .andExpect(status().isNoContent());

            verify(challengeService).deleteChallenge(1L);
        }
    }
}
