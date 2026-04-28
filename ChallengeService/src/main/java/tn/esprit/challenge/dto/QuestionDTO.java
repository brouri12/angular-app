package tn.esprit.challenge.dto;

import lombok.Data;
import tn.esprit.challenge.enums.QuestionType;

import java.util.List;

@Data
public class QuestionDTO {
    private Long id;
    private QuestionType type;
    private String questionText;
    private List<String> options;
    private String correctAnswer; // Hidden from students
    private List<String> acceptableAnswers; // Hidden from students
    private String explanation;
    private Integer points;
    private Integer orderIndex;
    private String imageUrl;
}
