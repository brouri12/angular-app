package tn.esprit.challenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tn.esprit.challenge.enums.SubmissionStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionWithChallengeDTO {
    private Long id;
    private Long challengeId;
    private String challengeTitle;
    private String challengeType;
    private String challengeLevel;
    private Long userId;
    private SubmissionStatus status;
    private Integer score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double percentage;
    private LocalDateTime submittedAt;
    private Long completionTime;
}
