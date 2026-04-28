package tn.esprit.clubservice.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.clubservice.entity.Club;
import tn.esprit.clubservice.entity.ClubType;
import tn.esprit.clubservice.repository.ClubRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ClubService {

    private final ClubRepository clubRepository;

    // dossier où on stocke les logos
    private final String uploadDir = "uploads/clubs/";

    public ClubService(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    public List<Club> getAll() {
        return clubRepository.findAll();
    }

    public Club getById(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Club introuvable"));
    }

    public Club create(Club club) {
        if (clubRepository.existsByNomClub(club.getNomClub())) {
            throw new RuntimeException("Un club avec ce nom existe déjà");
        }
        return clubRepository.save(club);
    }
    public Club createWithLogo(String nomClub, String description, ClubType type, String ville, MultipartFile file) {

        Club club = new Club();
        club.setNomClub(nomClub);
        club.setDescription(description);
        club.setType(type);
        club.setVille(ville);

        // 1) créer le club d'abord pour avoir id
        Club saved = clubRepository.save(club);

        // 2) si fichier existe → upload
        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = "uploads/clubs/";
                Files.createDirectories(Paths.get(uploadDir));

                String filename = "club_" + saved.getIdClub() + "_" + System.currentTimeMillis()
                        + "_" + file.getOriginalFilename().replace(" ", "_");

                Path path = Paths.get(uploadDir + filename);
                Files.write(path, file.getBytes());

                saved.setLogo(filename);
                saved = clubRepository.save(saved);

            } catch (Exception e) {
                throw new RuntimeException("Erreur upload logo: " + e.getMessage());
            }
        }

        return saved;
    }

    public Club update(Long id, Club clubDetails) {
        Club club = getById(id);

        club.setNomClub(clubDetails.getNomClub());
        club.setDescription(clubDetails.getDescription());
        club.setType(clubDetails.getType());
        club.setVille(clubDetails.getVille());

        // on ne touche pas au logo ici (upload séparé)
        return clubRepository.save(club);
    }

    public void delete(Long id) {
        Club club = getById(id);

        // supprimer aussi le fichier logo si existe
        if (club.getLogo() != null) {
            try {
                Path logoPath = Paths.get(uploadDir + club.getLogo());
                Files.deleteIfExists(logoPath);
            } catch (Exception ignored) {}
        }

        clubRepository.delete(club);
    }

    public List<Club> filterByType(ClubType type) {
        return clubRepository.findByType(type);
    }

    public List<Club> filterByVille(String ville) {
        return clubRepository.findByVille(ville);
    }

    // ✅ Upload logo
    public Club uploadLogo(Long clubId, MultipartFile file) {
        Club club = getById(clubId);

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Fichier logo vide");
        }

        // (optionnel) limiter types
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/png") || contentType.equals("image/jpeg"))) {
            throw new RuntimeException("Logo doit être PNG ou JPG");
        }

        try {
            Files.createDirectories(Paths.get(uploadDir));

            // supprimer l’ancien logo si existe
            if (club.getLogo() != null) {
                Files.deleteIfExists(Paths.get(uploadDir + club.getLogo()));
            }

            String original = file.getOriginalFilename() == null ? "logo" : file.getOriginalFilename();
            String filename = "club_" + clubId + "_" + System.currentTimeMillis() + "_" + original.replace(" ", "_");

            Path path = Paths.get(uploadDir + filename);
            Files.write(path, file.getBytes());

            club.setLogo(filename);
            return clubRepository.save(club);

        } catch (Exception e) {
            throw new RuntimeException("Erreur upload logo: " + e.getMessage());
        }
    }

    // ✅ URL du logo (pour front)
    public String getLogoUrl(Long clubId) {
        Club club = getById(clubId);
        if (club.getLogo() == null) return null;
        return "/uploads/clubs/" + club.getLogo();
    }

    // ✅ Lire le logo (download)
    public byte[] getLogoBytes(Long clubId) {
        Club club = getById(clubId);
        if (club.getLogo() == null) throw new RuntimeException("Aucun logo pour ce club");
        try {
            return Files.readAllBytes(Paths.get(uploadDir + club.getLogo()));
        } catch (Exception e) {
            throw new RuntimeException("Erreur lecture logo: " + e.getMessage());
        }
    }

    public void deleteByNomClub(String nomClub) {

        Club club = clubRepository.findByNomClub(nomClub)
                .orElseThrow(() -> new RuntimeException("Club introuvable"));

        // supprimer logo si existe
        if (club.getLogo() != null) {
            try {
                Path logoPath = Paths.get("uploads/clubs/" + club.getLogo());
                Files.deleteIfExists(logoPath);
            } catch (Exception ignored) {}
        }

        clubRepository.delete(club);
    }

}
