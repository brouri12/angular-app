package tn.esprit.recrutement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.recrutement.entity.OffreRecrutement;
import tn.esprit.recrutement.repository.OffreRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OffreService {
    
    private final OffreRepository offreRepository;
    
    public List<OffreRecrutement> getAllOffres() {
        return offreRepository.findAll();
    }
    
    public Optional<OffreRecrutement> getOffreById(Long id) {
        return offreRepository.findById(id);
    }
    
    public OffreRecrutement addOffre(OffreRecrutement offre) {
        offre.setDate_publication(LocalDate.now());
        if (offre.getStatut() == null) {
            offre.setStatut("OUVERTE");
        }
        return offreRepository.save(offre);
    }
    
    public Optional<OffreRecrutement> updateOffre(Long id, OffreRecrutement offreDetails) {
        return offreRepository.findById(id).map(offre -> {
            offre.setTitre(offreDetails.getTitre());
            offre.setDescription(offreDetails.getDescription());
            offre.setSpecialite(offreDetails.getSpecialite());
            offre.setExperience_min(offreDetails.getExperience_min());
            offre.setStatut(offreDetails.getStatut());
            return offreRepository.save(offre);
        });
    }
    
    public Optional<OffreRecrutement> fermerOffre(Long id) {
        return offreRepository.findById(id).map(offre -> {
            offre.setStatut("FERMEE");
            return offreRepository.save(offre);
        });
    }
    
    public Optional<OffreRecrutement> rouvrirOffre(Long id) {
        return offreRepository.findById(id).map(offre -> {
            offre.setStatut("OUVERTE");
            return offreRepository.save(offre);
        });
    }
    
    public boolean deleteOffre(Long id) {
        return offreRepository.findById(id).map(offre -> {
            offreRepository.delete(offre);
            return true;
        }).orElse(false);
    }
    
    public List<OffreRecrutement> getOffresByStatut(String statut) {
        return offreRepository.findByStatut(statut);
    }
    
    public List<OffreRecrutement> getOffresBySpecialite(String specialite) {
        return offreRepository.findBySpecialite(specialite);
    }
}
