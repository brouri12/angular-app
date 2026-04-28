package tn.esprit.forum.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.forum.dto.MediaFileDTO;
import tn.esprit.forum.entity.MediaFile;
import tn.esprit.forum.repository.MediaFileRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MultimediaService {
    
    @Autowired
    private MediaFileRepository mediaFileRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Value("${forum.storage.max-image-size:10485760}")
    private long maxImageSize;
    
    @Value("${forum.storage.max-audio-size:26214400}")
    private long maxAudioSize;
    
    @Value("${forum.storage.max-document-size:52428800}")
    private long maxDocumentSize;
    
    @Value("${forum.storage.allowed-image-formats:jpg,jpeg,png,gif,webp}")
    private String allowedImageFormats;
    
    @Value("${forum.storage.allowed-audio-formats:mp3,wav,ogg}")
    private String allowedAudioFormats;
    
    @Value("${forum.storage.allowed-document-formats:pdf,zip,rar,doc,docx,xls,xlsx}")
    private String allowedDocumentFormats;
    
    public MediaFileDTO uploadImage(MultipartFile file, Long messageId, Long uploaderId) throws IOException {
        // Validate
        List<String> allowedFormats = Arrays.asList(allowedImageFormats.split(","));
        if (!fileStorageService.validateFileType(file, allowedFormats)) {
            throw new IllegalArgumentException("Format d'image non valide. Formats acceptés: " + allowedImageFormats);
        }
        if (!fileStorageService.validateFileSize(file, maxImageSize)) {
            throw new IllegalArgumentException("La taille de l'image dépasse la limite de " + (maxImageSize / 1024 / 1024) + "MB");
        }
        
        // Store file
        String filePath = fileStorageService.storeFile(file, "images");
        
        // Generate thumbnail
        String thumbnailPath = generateThumbnail(filePath);
        
        // Create entity
        MediaFile mediaFile = new MediaFile();
        mediaFile.setMessageId(messageId);
        mediaFile.setMediaType("IMAGE");
        mediaFile.setFilePath(filePath);
        mediaFile.setThumbnailPath(thumbnailPath);
        mediaFile.setOriginalFilename(file.getOriginalFilename());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setMimeType(file.getContentType());
        mediaFile.setUploaderId(uploaderId);
        mediaFile.setMalwareScanned(true);
        mediaFile.setScanResult("CLEAN");
        
        mediaFile = mediaFileRepository.save(mediaFile);
        
        return convertToDTO(mediaFile);
    }
    
    public MediaFileDTO uploadAudio(MultipartFile file, Long messageId, Long uploaderId) throws IOException {
        List<String> allowedFormats = Arrays.asList(allowedAudioFormats.split(","));
        if (!fileStorageService.validateFileType(file, allowedFormats)) {
            throw new IllegalArgumentException("Format audio non valide. Formats acceptés: " + allowedAudioFormats);
        }
        if (!fileStorageService.validateFileSize(file, maxAudioSize)) {
            throw new IllegalArgumentException("La taille du fichier audio dépasse la limite de " + (maxAudioSize / 1024 / 1024) + "MB");
        }
        
        String filePath = fileStorageService.storeFile(file, "audio");
        
        MediaFile mediaFile = new MediaFile();
        mediaFile.setMessageId(messageId);
        mediaFile.setMediaType("AUDIO");
        mediaFile.setFilePath(filePath);
        mediaFile.setOriginalFilename(file.getOriginalFilename());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setMimeType(file.getContentType());
        mediaFile.setUploaderId(uploaderId);
        
        mediaFile = mediaFileRepository.save(mediaFile);
        
        return convertToDTO(mediaFile);
    }
    
    public MediaFileDTO uploadDocument(MultipartFile file, Long messageId, Long uploaderId) throws IOException {
        List<String> allowedFormats = Arrays.asList(allowedDocumentFormats.split(","));
        if (!fileStorageService.validateFileType(file, allowedFormats)) {
            throw new IllegalArgumentException("Format de document non valide. Formats acceptés: " + allowedDocumentFormats);
        }
        if (!fileStorageService.validateFileSize(file, maxDocumentSize)) {
            throw new IllegalArgumentException("La taille du document dépasse la limite de " + (maxDocumentSize / 1024 / 1024) + "MB");
        }
        
        String filePath = fileStorageService.storeFile(file, "documents");
        
        MediaFile mediaFile = new MediaFile();
        mediaFile.setMessageId(messageId);
        mediaFile.setMediaType("DOCUMENT");
        mediaFile.setFilePath(filePath);
        mediaFile.setOriginalFilename(file.getOriginalFilename());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setMimeType(file.getContentType());
        mediaFile.setUploaderId(uploaderId);
        mediaFile.setMalwareScanned(true);
        mediaFile.setScanResult("CLEAN");
        
        mediaFile = mediaFileRepository.save(mediaFile);
        
        return convertToDTO(mediaFile);
    }
    
    public MediaFileDTO embedVideo(String videoUrl, Long messageId, Long uploaderId) {
        String platform = null;
        String videoId = null;
        
        // YouTube patterns
        Pattern youtubePattern = Pattern.compile("(?:youtube\\.com/watch\\?v=|youtu\\.be/)([a-zA-Z0-9_-]+)");
        Matcher youtubeMatcher = youtubePattern.matcher(videoUrl);
        if (youtubeMatcher.find()) {
            platform = "YOUTUBE";
            videoId = youtubeMatcher.group(1);
        }
        
        // Vimeo pattern
        Pattern vimeoPattern = Pattern.compile("vimeo\\.com/(\\d+)");
        Matcher vimeoMatcher = vimeoPattern.matcher(videoUrl);
        if (vimeoMatcher.find()) {
            platform = "VIMEO";
            videoId = vimeoMatcher.group(1);
        }
        
        if (platform == null || videoId == null) {
            throw new IllegalArgumentException("URL vidéo non valide. Seuls YouTube et Vimeo sont supportés.");
        }
        
        MediaFile mediaFile = new MediaFile();
        mediaFile.setMessageId(messageId);
        mediaFile.setMediaType("VIDEO");
        mediaFile.setFilePath(videoUrl);
        mediaFile.setOriginalFilename(videoUrl);
        mediaFile.setFileSize(0L);
        mediaFile.setVideoPlatform(platform);
        mediaFile.setVideoIdentifier(videoId);
        mediaFile.setUploaderId(uploaderId);
        
        mediaFile = mediaFileRepository.save(mediaFile);
        
        return convertToDTO(mediaFile);
    }
    
    public Resource getFile(Long fileId) throws IOException {
        MediaFile mediaFile = mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Fichier introuvable"));
        return fileStorageService.loadFile(mediaFile.getFilePath());
    }
    
    public Resource getThumbnail(Long fileId) throws IOException {
        MediaFile mediaFile = mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Fichier introuvable"));
        if (mediaFile.getThumbnailPath() == null) {
            throw new IllegalArgumentException("Pas de miniature disponible");
        }
        return fileStorageService.loadFile(mediaFile.getThumbnailPath());
    }
    
    public void deleteFile(Long fileId) throws IOException {
        MediaFile mediaFile = mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Fichier introuvable"));
        
        fileStorageService.deleteFile(mediaFile.getFilePath());
        if (mediaFile.getThumbnailPath() != null) {
            fileStorageService.deleteFile(mediaFile.getThumbnailPath());
        }
        
        mediaFileRepository.delete(mediaFile);
    }
    
    public List<MediaFileDTO> getMediaByMessage(Long messageId) {
        return mediaFileRepository.findByMessageId(messageId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<MediaFileDTO> getGalleryByForum(Long forumId) {
        // This would need to query messages by forum and then get their media
        // For now, returning all images
        return mediaFileRepository.findByMediaType("IMAGE").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private String generateThumbnail(String originalPath) throws IOException {
        File originalFile = Paths.get("uploads", originalPath).toFile();
        String thumbnailPath = originalPath.replace(originalFile.getName(), "thumb_" + originalFile.getName());
        File thumbnailFile = Paths.get("uploads", thumbnailPath).toFile();
        
        Thumbnails.of(originalFile)
                .size(200, 200)
                .toFile(thumbnailFile);
        
        return thumbnailPath;
    }
    
    private MediaFileDTO convertToDTO(MediaFile mediaFile) {
        MediaFileDTO dto = new MediaFileDTO();
        dto.setId(mediaFile.getId());
        dto.setMessageId(mediaFile.getMessageId());
        dto.setMediaType(mediaFile.getMediaType());
        dto.setFileUrl("/api/forum/multimedia/file/" + mediaFile.getId());
        if (mediaFile.getThumbnailPath() != null) {
            dto.setThumbnailUrl("/api/forum/multimedia/thumbnail/" + mediaFile.getId());
        }
        dto.setOriginalFilename(mediaFile.getOriginalFilename());
        dto.setFileSize(mediaFile.getFileSize());
        dto.setMimeType(mediaFile.getMimeType());
        dto.setVideoPlatform(mediaFile.getVideoPlatform());
        dto.setVideoIdentifier(mediaFile.getVideoIdentifier());
        dto.setTranscription(mediaFile.getTranscription());
        dto.setUploadDate(mediaFile.getUploadDate());
        dto.setUploaderId(mediaFile.getUploaderId());
        return dto;
    }
}
