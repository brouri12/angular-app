package tn.esprit.abonnement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.abonnement.entity.Abonnement;
import tn.esprit.abonnement.entity.HistoriqueAbonnement;
import tn.esprit.abonnement.service.AbonnementService;
import tn.esprit.abonnement.service.HistoriqueAbonnementService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/abonnements")
public class AbonnementRestAPI {
    
    @Autowired
    private AbonnementService abonnementService;
    
    @Autowired
    private HistoriqueAbonnementService historiqueService;
    
    // Endpoint de test
    @GetMapping("/hello")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Bienvenue dans le microservice de gestion des abonnements!");
    }
    
    // ========== ENDPOINTS ABONNEMENTS ==========
    
    // Récupérer tous les abonnements
    @GetMapping
    public ResponseEntity<List<Abonnement>> getAllAbonnements() {
        List<Abonnement> abonnements = abonnementService.getAll();
        return ResponseEntity.ok(abonnements);
    }
    
    // Récupérer un abonnement par ID
    @GetMapping("/{id}")
    public ResponseEntity<Abonnement> getAbonnementById(@PathVariable Long id) {
        Optional<Abonnement> abonnement = abonnementService.getById(id);
        return abonnement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    // Rechercher par nom avec pagination
    @GetMapping("/search/byNom")
    public ResponseEntity<Page<Abonnement>> searchByNom(
            @RequestParam String nom,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Abonnement> abonnements = abonnementService.getByNom(nom, page, size);
        return ResponseEntity.ok(abonnements);
    }
    
    // Rechercher par statut
    @GetMapping("/search/byStatut")
    public ResponseEntity<List<Abonnement>> searchByStatut(@RequestParam String statut) {
        List<Abonnement> abonnements = abonnementService.getByStatut(statut);
        return ResponseEntity.ok(abonnements);
    }
    
    // Rechercher par prix maximum
    @GetMapping("/search/byPrixMax")
    public ResponseEntity<List<Abonnement>> searchByPrixMax(@RequestParam Double prix) {
        List<Abonnement> abonnements = abonnementService.getByPrixMax(prix);
        return ResponseEntity.ok(abonnements);
    }
    
    // Ajouter un nouvel abonnement
    @PostMapping
    public ResponseEntity<Abonnement> addAbonnement(@RequestBody Abonnement abonnement) {
        try {
            Abonnement savedAbonnement = abonnementService.add(abonnement);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAbonnement);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Mettre à jour un abonnement
    @PutMapping("/{id}")
    public ResponseEntity<Abonnement> updateAbonnement(
            @PathVariable Long id,
            @RequestBody Abonnement abonnement) {
        Optional<Abonnement> updatedAbonnement = abonnementService.update(id, abonnement);
        return updatedAbonnement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    // Mettre à jour uniquement le statut
    @PatchMapping("/{id}/statut")
    public ResponseEntity<Abonnement> updateStatut(
            @PathVariable Long id,
            @RequestParam String statut) {
        Optional<Abonnement> updatedAbonnement = abonnementService.updateStatut(id, statut);
        return updatedAbonnement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    // Supprimer un abonnement
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAbonnement(@PathVariable Long id) {
        boolean deleted = abonnementService.delete(id);
        if (deleted) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
    
    // ========== ENDPOINTS HISTORIQUE PAIEMENTS ==========
    
    // Ajouter un nouveau paiement
    @PostMapping("/paiements")
    public ResponseEntity<HistoriqueAbonnement> addPaiement(@RequestBody HistoriqueAbonnement historique) {
        try {
            HistoriqueAbonnement savedHistorique = historiqueService.addPaiement(historique);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedHistorique);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    // Récupérer tous les paiements
    @GetMapping("/paiements")
    public ResponseEntity<List<HistoriqueAbonnement>> getAllPaiements() {
        List<HistoriqueAbonnement> paiements = historiqueService.getAllPaiements();
        return ResponseEntity.ok(paiements);
    }
    
    // Récupérer un paiement par ID
    @GetMapping("/paiements/{id}")
    public ResponseEntity<HistoriqueAbonnement> getPaiementById(@PathVariable Long id) {
        Optional<HistoriqueAbonnement> paiement = historiqueService.getById(id);
        return paiement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    // Récupérer les paiements d'un client
    @GetMapping("/paiements/client/{email}")
    public ResponseEntity<List<HistoriqueAbonnement>> getPaiementsByClient(@PathVariable String email) {
        List<HistoriqueAbonnement> paiements = historiqueService.getByClient(email);
        return ResponseEntity.ok(paiements);
    }
    
    // Récupérer les paiements par statut
    @GetMapping("/paiements/search/byStatut")
    public ResponseEntity<List<HistoriqueAbonnement>> getPaiementsByStatut(@RequestParam String statut) {
        List<HistoriqueAbonnement> paiements = historiqueService.getByStatut(statut);
        return ResponseEntity.ok(paiements);
    }
    
    // Mettre à jour le statut d'un paiement
    @PatchMapping("/paiements/{id}/statut")
    public ResponseEntity<HistoriqueAbonnement> updateStatutPaiement(
            @PathVariable Long id,
            @RequestParam String statut) {
        Optional<HistoriqueAbonnement> updatedPaiement = historiqueService.updateStatutPaiement(id, statut);
        return updatedPaiement.map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
    
    // Supprimer un paiement
    @DeleteMapping("/paiements/{id}")
    public ResponseEntity<Void> deletePaiement(@PathVariable Long id) {
        boolean deleted = historiqueService.delete(id);
        if (deleted) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
