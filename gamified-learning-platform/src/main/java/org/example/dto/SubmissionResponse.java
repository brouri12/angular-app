package org.example.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class SubmissionResponse {
    private Long id;
    private Long gameId;
    private String gameTitle;
    private String userId;
    private String status;  // PASSED, PARTIAL, FAILED
    private Integer score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double percentage;
    private LocalDateTime submittedAt;
    private Long completionTime;
    private String feedback;
    private Map<Long, QuestionResultDTO> questionResults;
    private Boolean passed;
}
