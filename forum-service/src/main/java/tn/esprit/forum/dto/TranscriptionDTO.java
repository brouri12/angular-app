package tn.esprit.forum.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptionDTO {
    private Long fileId;
    private String transcription;
    private String language;
    private String status; // PENDING, COMPLETED, FAILED
}
