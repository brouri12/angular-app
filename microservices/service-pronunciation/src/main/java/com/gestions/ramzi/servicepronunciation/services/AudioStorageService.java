package com.gestions.ramzi.servicepronunciation.services;

import com.gestions.ramzi.servicepronunciation.dto.AudioAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service stockage audio + analyse
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AudioStorageService {

    private final AIService aiService;
    
    private static final String UPLOAD_DIR = "uploads/pronunciation/";
    
    /**
     * Stocker fichier audio
     */
    public String storeAudioFile(MultipartFile audioFile) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID() + "_" + audioFile.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(audioFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Audio stored: {}", filePath);
            return fileName;   // ← Return only filename, not full path
        } catch (IOException e) {
            log.error("Failed to store audio", e);
            throw new RuntimeException("Could not store audio file", e);
        }
    }
    /**
     * Charger fichier audio
     */
    public Resource loadAudioFile(String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found " + filename);
            
        } catch (Exception e) {
            log.error("Could not read audio file", e);
            throw new RuntimeException("Could not read audio file", e);
        }
    }

    /**
     * Analyser audio
     */
    public AudioAnalysisResult analyzeAudio(MultipartFile audioFile, String expectedText) {
        // Stocker temporairement
        String tempPath = storeAudioFile(audioFile);
        
        // Analyse IA
        AudioAnalysisResult result = aiService.analyzePronunciation(audioFile, expectedText);
        
        // Nettoyage temp (optionnel)
        // Files.deleteIfExists(Paths.get(tempPath));
        
        return result;
    }
}


