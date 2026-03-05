package tn.esprit.challenge.dto;

import lombok.Data;

import java.util.Map;

@Data
public class SubmissionRequest {
    private Long challengeId;
    private Long userId;
    private Map<Long, String> answers; // QuestionId -> Answer
    private Long completionTime; // In seconds
    private Integer hintsUsed;
    private String writtenResponse; // For writing challenges
}
