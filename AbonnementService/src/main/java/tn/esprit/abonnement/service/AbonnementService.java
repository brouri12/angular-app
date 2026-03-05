package tn.esprit.abonnement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tn.esprit.abonnement.entity.Abonnement;
import tn.esprit.abonnement.repository.AbonnementRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AbonnementService {
    
    @Autowired
    private AbonnementRepository abonnementRepository;
    
    // Récupérer tous les abonnements
    public List<Abonnement> getAll() {
        return abonnementRepository.findAll();
    }
    
    // Récupérer un abonnement par ID
    public Optional<Abonnement> getById(Long id) {
        return abonnementRepository.findById(id);
    }
    
    // Rechercher par nom avec pagination
    public Page<Abonnement> getByNom(String nom, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return abonnementRepository.findByNomContaining(nom, pageable);
    }
    
    // Rechercher par statut
    public List<Abonnement> getByStatut(String statut) {
        return abonnementRepository.findByStatut(statut);
    }
    
    // Rechercher par prix maximum
    public List<Abonnement> getByPrixMax(Double prix) {
        return abonnementRepository.findByPrixLessThanEqual(prix);
    }
    
    // Ajouter un nouvel abonnement
    public Abonnement add(Abonnement abonnement) {
        return abonnementRepository.save(abonnement);
    }
    
    // Mettre à jour un abonnement
    public Optional<Abonnement> update(Long id, Abonnement abonnementDetails) {
        return abonnementRepository.findById(id).map(abonnement -> {
            abonnement.setNom(abonnementDetails.getNom());
            abonnement.setDescription(abonnementDetails.getDescription());
            abonnement.setPrix(abonnementDetails.getPrix());
            abonnement.setDuree_jours(abonnementDetails.getDuree_jours());
            abonnement.setNiveau_acces(abonnementDetails.getNiveau_acces());
            abonnement.setAcces_illimite(abonnementDetails.getAcces_illimite());
            abonnement.setSupport_prioritaire(abonnementDetails.getSupport_prioritaire());
            abonnement.setStatut(abonnementDetails.getStatut());
            return abonnementRepository.save(abonnement);
        });
    }
    
    // Mettre à jour uniquement le statut
    public Optional<Abonnement> updateStatut(Long id, String statut) {
        return abonnementRepository.findById(id).map(abonnement -> {
            abonnement.setStatut(statut);
            return abonnementRepository.save(abonnement);
        });
    }
    
    // Supprimer un abonnement
    public boolean delete(Long id) {
        if (abonnementRepository.existsById(id)) {
            abonnementRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Vérifier si un abonnement existe
    public boolean exists(Long id) {
        return abonnementRepository.existsById(id);
    }
}
