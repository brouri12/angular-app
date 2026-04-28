package tn.esprit.forum.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.forum.dto.MediaFileDTO;
import tn.esprit.forum.service.MultimediaService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/forum/multimedia")
public class MultimediaController {
    
    @Autowired
    private MultimediaService multimediaService;
    
    @PostMapping("/upload/image")
    public ResponseEntity<MediaFileDTO> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("messageId") Long messageId,
            @RequestParam("uploaderId") Long uploaderId) {
        try {
            MediaFileDTO result = multimediaService.uploadImage(file, messageId, uploaderId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/upload/audio")
    public ResponseEntity<MediaFileDTO> uploadAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam("messageId") Long messageId,
            @RequestParam("uploaderId") Long uploaderId) {
        try {
            MediaFileDTO result = multimediaService.uploadAudio(file, messageId, uploaderId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/upload/document")
    public ResponseEntity<MediaFileDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("messageId") Long messageId,
            @RequestParam("uploaderId") Long uploaderId) {
        try {
            MediaFileDTO result = multimediaService.uploadDocument(file, messageId, uploaderId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/embed/video")
    public ResponseEntity<MediaFileDTO> embedVideo(
            @RequestParam("videoUrl") String videoUrl,
            @RequestParam("messageId") Long messageId,
            @RequestParam("uploaderId") Long uploaderId) {
        try {
            MediaFileDTO result = multimediaService.embedVideo(videoUrl, messageId, uploaderId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/file/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        try {
            Resource resource = multimediaService.getFile(fileId);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/thumbnail/{fileId}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable Long fileId) {
        try {
            Resource resource = multimediaService.getThumbnail(fileId);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/file/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
        try {
            multimediaService.deleteFile(fileId);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/message/{messageId}")
    public ResponseEntity<List<MediaFileDTO>> getMediaByMessage(@PathVariable Long messageId) {
        List<MediaFileDTO> media = multimediaService.getMediaByMessage(messageId);
        return ResponseEntity.ok(media);
    }
    
    @GetMapping("/gallery/{forumId}")
    public ResponseEntity<List<MediaFileDTO>> getGallery(@PathVariable Long forumId) {
        List<MediaFileDTO> gallery = multimediaService.getGalleryByForum(forumId);
        return ResponseEntity.ok(gallery);
    }
}
