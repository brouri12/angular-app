package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.GlobalStatsDTO;
import org.example.dto.UserRankDTO;
import org.example.dto.UserStatsDTO;
import org.example.service.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserStatsDTO> getUserStats(@PathVariable String userId) {
        return ResponseEntity.ok(statisticsService.getUserStats(userId));
    }

    @GetMapping("/global")
    public ResponseEntity<GlobalStatsDTO> getGlobalStats() {
        return ResponseEntity.ok(statisticsService.getGlobalStats());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserRankDTO>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(statisticsService.getLeaderboard(limit));
    }
}
