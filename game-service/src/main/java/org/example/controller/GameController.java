package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.GameDTO;
import org.example.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
@Slf4j
public class GameController {

    private final GameService gameService;

    @GetMapping
    public ResponseEntity<List<GameDTO>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGameById(id));
    }

    @GetMapping(params = "type")
    public ResponseEntity<List<GameDTO>> getByType(@RequestParam String type) {
        return ResponseEntity.ok(gameService.getGamesByType(type));
    }

    @GetMapping(params = "difficulty")
    public ResponseEntity<List<GameDTO>> getByDifficulty(@RequestParam String difficulty) {
        return ResponseEntity.ok(gameService.getGamesByDifficulty(difficulty));
    }
}
