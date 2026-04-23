package tn.esprit.forum.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.forum.service.AnalyseService;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/forum/analyse")
@RequiredArgsConstructor
public class AnalyseController {
    
    private final AnalyseService analyseService;
    
    @GetMapping("/statistiques/globales")
    public ResponseEntity<Map<String, Object>> getStatistiquesGlobales() {
        return ResponseEntity.ok(analyseService.getStatistiquesGlobales());
    }
    
    @GetMapping("/statistiques/par-forum")
    public ResponseEntity<Map<String, Object>> getStatistiquesParForum() {
        return ResponseEntity.ok(analyseService.getStatistiquesParForum());
    }
    
    @GetMapping("/statistiques/par-niveau")
    public ResponseEntity<Map<String, Object>> getStatistiquesParNiveau() {
        return ResponseEntity.ok(analyseService.getStatistiquesParNiveau());
    }
    
    @GetMapping("/forum-plus-actif")
    public ResponseEntity<Map<String, Object>> getForumLePlusActif() {
        return ResponseEntity.ok(analyseService.getForumLePlusActif());
    }
    
    @GetMapping("/etudiant-plus-actif")
    public ResponseEntity<Map<String, Object>> getEtudiantLePlusActif() {
        return ResponseEntity.ok(analyseService.getEtudiantLePlusActif());
    }
    
    @GetMapping("/engagement/par-groupe")
    public ResponseEntity<Map<String, Object>> getTauxEngagementParGroupe() {
        return ResponseEntity.ok(analyseService.getTauxEngagementParGroupe());
    }
    
    @GetMapping("/activite/periode")
    public ResponseEntity<Map<String, Object>> getAnalysePeriodeActivite(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        return ResponseEntity.ok(analyseService.getAnalysePeriodeActivite(dateDebut, dateFin));
    }
}
