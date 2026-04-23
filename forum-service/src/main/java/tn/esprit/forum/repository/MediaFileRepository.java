package tn.esprit.forum.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.esprit.forum.entity.MediaFile;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    
    // Méthodes de recherche de base
    List<MediaFile> findByMessageId(Long messageId);
    List<MediaFile> findByMediaType(String mediaType);
    List<MediaFile> findByUploaderId(Long uploaderId);
    
    // Recherche par période
    List<MediaFile> findByUploadDateBetween(LocalDateTime start, LocalDateTime end);
    
    // Recherche par type et période
    @Query("SELECT m FROM MediaFile m WHERE m.mediaType = :mediaType AND m.uploadDate BETWEEN :start AND :end")
    List<MediaFile> findByMediaTypeAndDateRange(
        @Param("mediaType") String mediaType,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
    
    // Récupérer toutes les images d'un forum (via messages)
    @Query("SELECT m FROM MediaFile m WHERE m.mediaType = 'IMAGE' AND m.messageId IN " +
           "(SELECT msg.id FROM MessageForum msg WHERE msg.forum.id = :forumId)")
    List<MediaFile> findImagesByForumId(@Param("forumId") Long forumId);
    
    // Statistiques de stockage par type
    @Query("SELECT m.mediaType, COUNT(m), SUM(m.fileSize) FROM MediaFile m GROUP BY m.mediaType")
    List<Object[]> getStorageStatsByMediaType();
    
    // Fichiers nécessitant scan antivirus
    List<MediaFile> findByMalwareScannedFalse();
    
    // Fichiers avec transcription disponible
    @Query("SELECT m FROM MediaFile m WHERE m.transcription IS NOT NULL AND m.mediaType IN ('AUDIO', 'VIDEO')")
    List<MediaFile> findFilesWithTranscription();
    
    // Recherche par nom de fichier
    @Query("SELECT m FROM MediaFile m WHERE LOWER(m.originalFilename) LIKE LOWER(CONCAT('%', :filename, '%'))")
    List<MediaFile> searchByFilename(@Param("filename") String filename);
    
    // Fichiers les plus récents par type
    @Query("SELECT m FROM MediaFile m WHERE m.mediaType = :mediaType ORDER BY m.uploadDate DESC")
    List<MediaFile> findRecentByMediaType(@Param("mediaType") String mediaType);
    
    // Compter fichiers par utilisateur
    @Query("SELECT COUNT(m) FROM MediaFile m WHERE m.uploaderId = :uploaderId")
    Long countByUploaderId(@Param("uploaderId") Long uploaderId);
    
    // Taille totale des fichiers par utilisateur
    @Query("SELECT SUM(m.fileSize) FROM MediaFile m WHERE m.uploaderId = :uploaderId")
    Long getTotalFileSizeByUploaderId(@Param("uploaderId") Long uploaderId);
}
