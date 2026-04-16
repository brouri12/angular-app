package tn.esprit.planification.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.esprit.planification.dto.RoomAnalyticsSummaryDTO;
import tn.esprit.planification.service.RoomAnalyticsService;

@RestController
@RequestMapping("/api/analytics/rooms")
@RequiredArgsConstructor
public class RoomAnalyticsController {
    
    private final RoomAnalyticsService roomAnalyticsService;
    
    @GetMapping
    public ResponseEntity<RoomAnalyticsSummaryDTO> getRoomAnalytics() {
        RoomAnalyticsSummaryDTO analytics = roomAnalyticsService.getRoomAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
