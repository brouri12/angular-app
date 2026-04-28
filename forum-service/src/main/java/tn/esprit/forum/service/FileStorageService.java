package tn.esprit.forum.service;

import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${forum.storage.upload-directory:uploads}")
    private String uploadDirectory;
    
    private final Tika tika = new Tika();
    
    public String storeFile(MultipartFile file, String mediaType) throws IOException {
        // Create directory structure: uploads/{mediaType}/{year}/{month}/
        LocalDate now = LocalDate.now();
        String subPath = String.format("%s/%d/%02d", mediaType.toLowerCase(), now.getYear(), now.getMonthValue());
        Path uploadPath = Paths.get(uploadDirectory, subPath);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String filename = generateUniqueFileName(file.getOriginalFilename());
        Path filePath = uploadPath.resolve(filename);
        
        // Copy file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return subPath + "/" + filename;
    }
    
    public Resource loadFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDirectory).resolve(filePath).normalize();
        Resource resource = new UrlResource(path.toUri());
        
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("Fichier introuvable: " + filePath);
        }
    }
    
    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDirectory).resolve(filePath).normalize();
        Files.deleteIfExists(path);
    }
    
    public boolean validateFileType(MultipartFile file, List<String> allowedTypes) throws IOException {
        String mimeType = tika.detect(file.getInputStream());
        String extension = getFileExtension(file.getOriginalFilename()).toLowerCase();
        
        return allowedTypes.stream()
                .anyMatch(type -> extension.equals(type.toLowerCase()) || 
                         mimeType.contains(type.toLowerCase()));
    }
    
    public boolean validateFileSize(MultipartFile file, long maxSizeBytes) {
        return file.getSize() <= maxSizeBytes;
    }
    
    public String generateUniqueFileName(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        return UUID.randomUUID().toString() + "." + extension;
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
