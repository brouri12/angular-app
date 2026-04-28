package tn.esprit.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forum.entity.BadgeUtilisateur;
import tn.esprit.forum.service.BadgeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/badges")
@RequiredArgsConstructor
public class BadgeController {
    
    private final BadgeService badgeService;
    
    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<BadgeUtilisateur> getBadgeUtilisateur(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(badgeService.getBadgeUtilisateur(utilisateurId));
    }
    
    @PostMapping("/utilisateur/{utilisateurId}/points")
    public ResponseEntity<Void> ajouterPoints(
            @PathVariable Long utilisateurId,
            @RequestParam Integer points) {
        badgeService.ajouterPoints(utilisateurId, points);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/utilisateur/{utilisateurId}/points")
    public ResponseEntity<Void> retirerPoints(
            @PathVariable Long utilisateurId,
            @RequestParam Integer points) {
        badgeService.retirerPoints(utilisateurId, points);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/utilisateur/{utilisateurId}/statistiques")
    public ResponseEntity<BadgeUtilisateur> mettreAJourStatistiques(
            @PathVariable Long utilisateurId) {
        BadgeUtilisateur badge = badgeService.mettreAJourStatistiques(utilisateurId);
        return ResponseEntity.ok(badge);
    }
    
    @GetMapping("/top-contributeurs")
    public ResponseEntity<List<BadgeUtilisateur>> getTopContributeurs() {
        return ResponseEntity.ok(badgeService.getTopContributeurs());
    }
    
    @GetMapping("/niveau/{niveau}")
    public ResponseEntity<List<BadgeUtilisateur>> getBadgesByNiveau(@PathVariable String niveau) {
        return ResponseEntity.ok(badgeService.getBadgesByNiveau(niveau));
    }
}
