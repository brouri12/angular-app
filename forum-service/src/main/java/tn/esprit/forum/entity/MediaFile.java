package tn.esprit.forum.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MediaFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "message_id")
    private Long messageId;
    
    @NotBlank
    @Column(name = "media_type")
    private String mediaType; // IMAGE, VIDEO, AUDIO, DOCUMENT
    
    @NotBlank
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "thumbnail_path")
    private String thumbnailPath;
    
    @NotBlank
    @Column(name = "original_filename")
    private String originalFilename;
    
    @NotNull
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "mime_type")
    private String mimeType;
    
    @Column(name = "video_platform")
    private String videoPlatform; // YOUTUBE, VIMEO
    
    @Column(name = "video_identifier")
    private String videoIdentifier;
    
    @Column(name = "transcription", length = 10000)
    private String transcription;
    
    @Column(name = "transcription_language")
    private String transcriptionLanguage;
    
    @NotNull
    @Column(name = "upload_date")
    private LocalDateTime uploadDate;
    
    @NotNull
    @Column(name = "uploader_id")
    private Long uploaderId;
    
    @Column(name = "malware_scanned")
    private Boolean malwareScanned;
    
    @Column(name = "scan_result")
    private String scanResult;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", insertable = false, updatable = false)
    private MessageForum messageForum;
    
    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
        if (malwareScanned == null) {
            malwareScanned = false;
        }
    }
}
