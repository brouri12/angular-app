package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.GameDTO;
import org.example.dto.QuestionDTO;
import org.example.repository.GameRepository;
import org.example.repository.QuestionRepository;
import org.example.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminGameController {

    private final GameService gameService;
    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;

    // ─── Games ────────────────────────────────────────────────────────────────

    @GetMapping("/games")
    public ResponseEntity<List<GameDTO>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGamesAdmin());
    }

    @GetMapping("/games/{id}")
    public ResponseEntity<GameDTO> getGame(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGameByIdAdmin(id));
    }

    @PostMapping("/games")
    public ResponseEntity<GameDTO> createGame(@RequestBody GameDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gameService.createGame(dto));
    }

    @PutMapping("/games/{id}")
    public ResponseEntity<GameDTO> updateGame(@PathVariable Long id, @RequestBody GameDTO dto) {
        return ResponseEntity.ok(gameService.updateGame(id, dto));
    }

    @DeleteMapping("/games/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/games/{id}/toggle")
    public ResponseEntity<GameDTO> toggleGame(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.toggleGame(id));
    }

    // ─── Questions ────────────────────────────────────────────────────────────

    @GetMapping("/games/{gameId}/questions")
    public ResponseEntity<List<QuestionDTO>> getQuestions(@PathVariable Long gameId) {
        return ResponseEntity.ok(gameService.getQuestions(gameId));
    }

    @PostMapping("/games/{gameId}/questions")
    public ResponseEntity<QuestionDTO> addQuestion(
            @PathVariable Long gameId,
            @RequestBody QuestionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gameService.addQuestion(gameId, dto));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionDTO> updateQuestion(
            @PathVariable Long id,
            @RequestBody QuestionDTO dto) {
        return ResponseEntity.ok(gameService.updateQuestion(id, dto));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        gameService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Stats ────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
            "totalGames", gameRepository.count(),
            "activeGames", gameRepository.countByIsActiveTrue(),
            "totalContent", questionRepository.count()
        ));
    }
}
