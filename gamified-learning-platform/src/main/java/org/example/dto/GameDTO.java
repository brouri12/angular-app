package org.example.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GameDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private String difficulty;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Long questionCount;
    private Integer totalAttempts;
    private Double successRate;   // 0-100 %
    private List<QuestionDTO> questions;  // included when fetching single game for play
}
