package com.esprit.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AnswerResponseDTO {
    private Long idAnswer;
    private String answer;
    private Long idEval;
}
