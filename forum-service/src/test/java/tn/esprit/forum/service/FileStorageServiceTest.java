package tn.esprit.forum.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import tn.esprit.forum.exception.FileValidationException;
import tn.esprit.forum.exception.StorageException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for FileStorageService
 */
class FileStorageServiceTest {

    @TempDir
    Path tempDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        // Use temp directory for testing
        fileStorageService = new FileStorageService();
        // Use reflection to set the uploadDirectory field for testing
        try {
            var field = FileStorageService.class.getDeclaredField("uploadDirectory");
            field.setAccessible(true);
            field.set(fileStorageService, tempDir.toString());
        } catch (Exception e) {
            throw new RuntimeException("Failed to set uploadDirectory", e);
        }
    }

    @Test
    void testStoreFile_Success() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // Act
        String filePath = fileStorageService.storeFile(file, "IMAGE");

        // Assert
        assertNotNull(filePath);
        assertTrue(filePath.contains("image"));
        assertTrue(filePath.endsWith(".jpg"));
    }

    @Test
    void testStoreFile_EmptyFile_ThrowsException() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        // Act & Assert
        assertThrows(FileValidationException.class, () -> {
            fileStorageService.storeFile(emptyFile, "IMAGE");
        });
    }

    @Test
    void testLoadFile_Success() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );
        String filePath = fileStorageService.storeFile(file, "IMAGE");

        // Act
        Resource resource = fileStorageService.loadFile(filePath);

        // Assert
        assertNotNull(resource);
        assertTrue(resource.exists());
        assertTrue(resource.isReadable());
    }

    @Test
    void testLoadFile_NonExistent_ThrowsException() {
        // Act & Assert
        assertThrows(StorageException.class, () -> {
            fileStorageService.loadFile("nonexistent/file.jpg");
        });
    }

    @Test
    void testDeleteFile_Success() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );
        String filePath = fileStorageService.storeFile(file, "IMAGE");
        Path fullPath = tempDir.resolve(filePath);
        assertTrue(Files.exists(fullPath));

        // Act
        fileStorageService.deleteFile(filePath);

        // Assert
        assertFalse(Files.exists(fullPath));
    }

    @Test
    void testDeleteFile_NonExistent_DoesNotThrow() {
        // Act & Assert - should not throw exception (idempotent)
        assertDoesNotThrow(() -> {
            fileStorageService.deleteFile("nonexistent/file.jpg");
        });
    }

    @Test
    void testValidateFileType_ValidExtension() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // Act
        boolean isValid = fileStorageService.validateFileType(file, Arrays.asList("jpg", "png", "gif"));

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testValidateFileType_InvalidExtension() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.exe",
                "application/x-msdownload",
                "malicious content".getBytes()
        );

        // Act
        boolean isValid = fileStorageService.validateFileType(file, Arrays.asList("jpg", "png", "gif"));

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testValidateFileSize_WithinLimit() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                new byte[1024] // 1KB
        );

        // Act
        boolean isValid = fileStorageService.validateFileSize(file, 10 * 1024); // 10KB limit

        // Assert
        assertTrue(isValid);
    }

    @Test
    void testValidateFileSize_ExceedsLimit() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                new byte[20 * 1024] // 20KB
        );

        // Act
        boolean isValid = fileStorageService.validateFileSize(file, 10 * 1024); // 10KB limit

        // Assert
        assertFalse(isValid);
    }

    @Test
    void testGenerateUniqueFileName_ContainsUUID() {
        // Act
        String uniqueFilename1 = fileStorageService.generateUniqueFileName("test.jpg");
        String uniqueFilename2 = fileStorageService.generateUniqueFileName("test.jpg");

        // Assert
        assertNotNull(uniqueFilename1);
        assertNotNull(uniqueFilename2);
        assertNotEquals(uniqueFilename1, uniqueFilename2); // Should be unique
        assertTrue(uniqueFilename1.endsWith(".jpg"));
        assertTrue(uniqueFilename2.endsWith(".jpg"));
    }

    @Test
    void testStoreFile_CreatesDirectoryStructure() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // Act
        String filePath = fileStorageService.storeFile(file, "IMAGE");

        // Assert
        Path fullPath = tempDir.resolve(filePath);
        assertTrue(Files.exists(fullPath));
        
        // Verify directory structure contains year and month
        String pathString = filePath.toLowerCase();
        assertTrue(pathString.contains("image"));
        // Path should contain year (4 digits) and month (2 digits)
        assertTrue(pathString.matches(".*\\d{4}.*\\d{2}.*"));
    }
}
