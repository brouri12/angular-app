package tn.esprit.abonnement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.abonnement.entity.HistoriqueAbonnement;
import tn.esprit.abonnement.repository.HistoriqueAbonnementRepository;

import java.util.List;
import java.util.Optional;

@Service
public class HistoriqueAbonnementService {
    
    @Autowired
    private HistoriqueAbonnementRepository historiqueRepository;
    
    // Ajouter un nouveau paiement
    public HistoriqueAbonnement addPaiement(HistoriqueAbonnement historique) {
        return historiqueRepository.save(historique);
    }
    
    // Récupérer tous les paiements
    public List<HistoriqueAbonnement> getAllPaiements() {
        return historiqueRepository.findAll();
    }
    
    // Récupérer un paiement par ID
    public Optional<HistoriqueAbonnement> getById(Long id) {
        return historiqueRepository.findById(id);
    }
    
    // Récupérer les paiements d'un client par email
    public List<HistoriqueAbonnement> getByClient(String email) {
        return historiqueRepository.findByEmailClient(email);
    }
    
    // Récupérer les paiements par statut
    public List<HistoriqueAbonnement> getByStatut(String statut) {
        return historiqueRepository.findByStatut(statut);
    }
    
    // Récupérer les paiements par type d'abonnement
    public List<HistoriqueAbonnement> getByTypeAbonnement(String type) {
        return historiqueRepository.findByTypeAbonnement(type);
    }
    
    // Mettre à jour le statut d'un paiement
    public Optional<HistoriqueAbonnement> updateStatutPaiement(Long id, String statut) {
        return historiqueRepository.findById(id).map(historique -> {
            historique.setStatut(statut);
            return historiqueRepository.save(historique);
        });
    }
    
    // Supprimer un paiement
    public boolean delete(Long id) {
        if (historiqueRepository.existsById(id)) {
            historiqueRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
