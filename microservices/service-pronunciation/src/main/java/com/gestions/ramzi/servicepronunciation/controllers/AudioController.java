package com.gestions.ramzi.servicepronunciation.controllers;

import com.gestions.ramzi.servicepronunciation.dto.AudioAnalysisResult;
import com.gestions.ramzi.servicepronunciation.services.AudioStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.gestions.ramzi.servicepronunciation.dto.AudioAnalysisResult;

import java.nio.file.Files;
import java.nio.file.Paths;


@RestController
@RequestMapping("/api/pronunciation/audio")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class AudioController {

    private final AudioStorageService audioStorageService;

    /**
     * Upload fichier audio
     */
    @PostMapping("/upload")
    public ResponseEntity<AudioUploadResponse> uploadAudio(
            @RequestParam MultipartFile audioFile) {
        
        log.info("Uploading audio: {}", audioFile.getOriginalFilename());
        
        String filePath = audioStorageService.storeAudioFile(audioFile);
        
AudioUploadResponse response = new AudioUploadResponse(
                audioFile.getOriginalFilename(),
                filePath,
                audioFile.getSize());
                
        return ResponseEntity.ok(response);
    }

    /**
     * Télécharger fichier audio
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getAudioFile(@PathVariable String filename) {
        try {
            Resource resource = audioStorageService.loadAudioFile(filename);

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Better content type detection (works for webm, mp3, wav, etc.)
            String contentType = "audio/mpeg";
            try {
                contentType = Files.probeContentType(Paths.get("uploads/pronunciation/" + filename));
                if (contentType == null) contentType = "audio/webm"; // fallback for recordings
            } catch (Exception ignored) {}

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")  // inline = play in browser
                    .body(resource);

        } catch (Exception e) {
            log.error("Error serving audio file: {}", filename, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Analyser audio (wrapper AIService)
     */
@PostMapping("/analyze")
    public ResponseEntity<AudioAnalysisResult> analyzeAudio(
            @RequestParam MultipartFile audioFile,
            @RequestParam String expectedText) {
        
        AudioAnalysisResult analysis = audioStorageService.analyzeAudio(audioFile, expectedText);
        return ResponseEntity.ok(analysis);
    }

    /**
     * Upload Response Builder (temporary fix)
     */
    public static AudioUploadResponse buildAudioUploadResponse(String filename, String path, long size) {
        return new AudioUploadResponse(filename, path, size);
    }
}

record AudioUploadResponse(
    String filename,
    String path,
    long size
) {}


