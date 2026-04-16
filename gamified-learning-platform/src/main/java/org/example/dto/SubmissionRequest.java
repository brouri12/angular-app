package org.example.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SubmissionRequest {
    private Long gameId;
    private String userId;
    private Map<Long, String> answers;  // questionId -> answer
    private Long completionTime;  // seconds
    private Integer scoreOverride;  // used by crossword (gameId=0) to pass XP directly
    private Integer correctOverride; // used by crossword to pass correct word count
    private Integer totalOverride;   // used by crossword to pass total word count
}
