package com.esprit.demo.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/eval/files")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private final String uploadDir = "uploads/";

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        System.out.println("Received upload request for file: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
        if (file.isEmpty()) {
            System.out.println("Upload failed: File is empty");
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                System.out.println("Creating directory: " + directory.getAbsolutePath());
                directory.mkdirs();
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + filename);
            System.out.println("Writing file to: " + path.toAbsolutePath());
            Files.write(path, file.getBytes());

            // Return the URL to access the file
            String fileUrl = "http://localhost:8087/evaluation/uploads/" + filename;
            System.out.println("Upload successful. URL: " + fileUrl);
            return ResponseEntity.ok(fileUrl);
        } catch (IOException e) {
            System.err.println("Upload failed with error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Could not upload file: " + e.getMessage());
        }
    }
}
