package com.esprit.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ScoreResponseDTO {
    private Long idAnswer;
    private Double totalScore;
    private Double grammarScore;
    private Double listeningScore;
    private Double essayScore;
    private String message;
}
