package org.example.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuestionDTO {
    private Long id;
    private String questionText;
    private List<String> options;
    private String correctAnswer;  // null when sent to players, included for admin
    private String explanation;
    private Integer points;
    private Integer orderIndex;
}
