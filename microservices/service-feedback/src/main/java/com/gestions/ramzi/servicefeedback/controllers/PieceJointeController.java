package com.gestions.ramzi.servicefeedback.controllers;

import com.gestions.ramzi.servicefeedback.entities.PieceJointe;
import com.gestions.ramzi.servicefeedback.services.PieceJointeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/piecesjointes")
public class PieceJointeController {

    private static final Logger logger = LoggerFactory.getLogger(PieceJointeController.class);

    private final PieceJointeService service;

    public PieceJointeController(PieceJointeService service) {
        this.service = service;
        logger.info("PieceJointeController initialized");
    }

    /**
     * Get all pieces jointes for a reclamation
     * GET /api/piecesjointes/reclamation/{reclamationId}
     */
    @GetMapping("/reclamation/{reclamationId}")
    public List<PieceJointe> getByReclamation(@PathVariable Long reclamationId) {
        logger.info("GET /api/piecesjointes/reclamation/{}", reclamationId);
        return service.getByReclamationId(reclamationId);
    }

    /**
     * Upload a file for a reclamation
     * POST /api/piecesjointes/upload
     */
    @PostMapping("/upload")
    public ResponseEntity<PieceJointe> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("reclamationId") Long reclamationId) {
        logger.info("POST /api/piecesjointes/upload - reclamationId: {}, file: {}", reclamationId, file.getOriginalFilename());
        
        try {
            PieceJointe pieceJointe = service.uploadFile(file, reclamationId);
            return ResponseEntity.ok(pieceJointe);
        } catch (Exception e) {
            logger.error("Error uploading file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Download a file
     * GET /api/piecesjointes/{id}/download
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        logger.info("GET /api/piecesjointes/{}/download", id);
        
        try {
            byte[] fileData = service.downloadFile(id);
            
            PieceJointe pieceJointe = service.getByReclamationId(null).stream()
                    .filter(pj -> pj.getId().equals(id))
                    .findFirst()
                    .orElse(null);
            
            String filename = pieceJointe != null ? pieceJointe.getNomFichier() : "file";
            String contentType = pieceJointe != null ? pieceJointe.getTypeContenu() : "application/octet-stream";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileData);
        } catch (Exception e) {
            logger.error("Error downloading file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete a file
     * DELETE /api/piecesjointes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        logger.info("DELETE /api/piecesjointes/{}", id);
        
        try {
            service.deleteFile(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting file: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

