package tn.esprit.clubservice.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.clubservice.entity.Club;
import tn.esprit.clubservice.entity.ClubType;
import tn.esprit.clubservice.service.ClubService;

import java.util.List;

@RestController
@RequestMapping("/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {this.clubService = clubService;}
    // CRUD

    @PostMapping
    public Club create(@RequestBody Club club) {return clubService.create(club);}

    // ✅ Upload logo
    @PostMapping(value = "/{id}/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Club uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return clubService.uploadLogo(id, file);
    }

    @PostMapping(value = "/create-with-logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Club createWithLogo(
            @RequestParam("nomClub") String nomClub,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("type") ClubType type,
            @RequestParam(value = "ville", required = false) String ville,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return clubService.createWithLogo(nomClub, description, type, ville, file);
    }

    @PutMapping("/{id}")
    public Club update(@PathVariable Long id, @RequestBody Club club) {
        return clubService.update(id, club);
    }
    @GetMapping
    public List<Club> getAll() {return clubService.getAll();}

    @GetMapping("/{id}")
    public Club getById(@PathVariable Long id) {return clubService.getById(id);}

    @GetMapping("/type/{type}")
    public List<Club> byType(@PathVariable ClubType type) {
        return clubService.filterByType(type);
    }

    @GetMapping("/ville/{ville}")
    public List<Club> byVille(@PathVariable String ville) {
        return clubService.filterByVille(ville);
    }

    // ✅ Get logo URL (pour front)
    @GetMapping("/{id}/logo-url")
    public ResponseEntity<String> getLogoUrl(@PathVariable Long id) {
        String url = clubService.getLogoUrl(id);
        return ResponseEntity.ok(url);
    }

    // ✅ Download logo (retourne l'image)
    @GetMapping(value = "/{id}/logo", produces = {MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_JPEG_VALUE})
    public ResponseEntity<byte[]> getLogo(@PathVariable Long id) {
        byte[] bytes = clubService.getLogoBytes(id);
        return ResponseEntity.ok(bytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clubService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/by-name")
    public ResponseEntity<String> deleteByName(@RequestParam String nomClub) {
        clubService.deleteByNomClub(nomClub);
        return ResponseEntity.ok("Club supprimé");
    }


    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handle(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
