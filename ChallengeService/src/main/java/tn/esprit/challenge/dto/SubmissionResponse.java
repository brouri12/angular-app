package tn.esprit.challenge.dto;

import lombok.Data;
import tn.esprit.challenge.enums.SubmissionStatus;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class SubmissionResponse {
    private Long id;
    private Long challengeId;
    private Long userId;
    private SubmissionStatus status;
    private Integer score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double percentage;
    private LocalDateTime submittedAt;
    private Long completionTime;
    private String feedback;
    private Map<Long, QuestionResultDTO> questionResults; // QuestionId -> Result
    private Boolean passed;
}
