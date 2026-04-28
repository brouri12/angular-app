package tn.esprit.challenge.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class SubmissionRequest {
    private Long challengeId;
    private Long userId;
    private Map<Long, String> answers = new HashMap<>();
    private Long completionTime;
    private Integer hintsUsed;
    private String writtenResponse;

    // Handle JSON string keys being deserialized as Long
    @JsonAnySetter
    public void setAnswerFromJson(String key, String value) {
        this.answers.put(Long.parseLong(key), value);
    }
}
