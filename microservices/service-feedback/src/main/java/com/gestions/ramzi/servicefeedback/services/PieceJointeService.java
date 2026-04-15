package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.entities.PieceJointe;
import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import com.gestions.ramzi.servicefeedback.repositories.PieceJointeRepository;
import com.gestions.ramzi.servicefeedback.repositories.ReclamationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class PieceJointeService {

    private static final Logger logger = LoggerFactory.getLogger(PieceJointeService.class);

    private final PieceJointeRepository repository;
    private final ReclamationRepository reclamationRepository;

    @Value("${app.upload.dir:./uploads/reclamations}")
    private String uploadDir;

    public PieceJointeService(PieceJointeRepository repository, ReclamationRepository reclamationRepository) {
        this.repository = repository;
        this.reclamationRepository = reclamationRepository;
    }

    public List<PieceJointe> getByReclamationId(Long reclamationId) {
        return repository.findByReclamationId(reclamationId);
    }

    @Transactional
    public PieceJointe uploadFile(MultipartFile file, Long reclamationId) throws IOException {
        // Verify reclamation exists
        Reclamation reclamation = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new IllegalArgumentException("Réclamation non trouvée: " + reclamationId));

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, reclamationId.toString());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);

        // Create PieceJointe entity
        PieceJointe pieceJointe = new PieceJointe();
        pieceJointe.setNomFichier(originalFilename);
        pieceJointe.setTypeContenu(file.getContentType());
        pieceJointe.setCheminFichier(filePath.toString());
        pieceJointe.setTailleFichier(file.getSize());
        pieceJointe.setReclamation(reclamation);

        logger.info("Fichier uploadé: {} pour la réclamation {}", uniqueFilename, reclamationId);
        
        return repository.save(pieceJointe);
    }

    public byte[] downloadFile(Long id) throws IOException {
        PieceJointe pieceJointe = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pièce jointe non trouvée: " + id));

        Path filePath = Paths.get(pieceJointe.getCheminFichier());
        return Files.readAllBytes(filePath);
    }

    @Transactional
    public void deleteFile(Long id) throws IOException {
        PieceJointe pieceJointe = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pièce jointe non trouvée: " + id));

        // Delete file from disk
        Path filePath = Paths.get(pieceJointe.getCheminFichier());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }

        // Delete from database
        repository.delete(pieceJointe);
        logger.info("Fichier supprimé: {}", id);
    }
}

