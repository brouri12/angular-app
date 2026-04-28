package tn.esprit.forum.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaFileDTO {
    private Long id;
    private Long messageId;
    private String mediaType;
    private String fileUrl;
    private String thumbnailUrl;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private String videoPlatform;
    private String videoIdentifier;
    private String transcription;
    private LocalDateTime uploadDate;
    private Long uploaderId;
}
