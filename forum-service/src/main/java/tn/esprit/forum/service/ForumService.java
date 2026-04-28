package tn.esprit.forum.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tn.esprit.forum.entity.Forum;
import tn.esprit.forum.repository.ForumRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ForumService {
    
    private final ForumRepository forumRepository;
    
    public List<Forum> getAllForums() {
        return forumRepository.findAll();
    }
    
    public Optional<Forum> getForumById(Long id) {
        return forumRepository.findById(id);
    }
    
    public Forum addForum(Forum forum) {
        forum.setDate_creation(LocalDate.now());
        if (forum.getStatut() == null) {
            forum.setStatut("OUVERT");
        }
        return forumRepository.save(forum);
    }
    
    public Optional<Forum> updateForum(Long id, Forum forumDetails) {
        return forumRepository.findById(id).map(forum -> {
            forum.setTitre(forumDetails.getTitre());
            forum.setDescription(forumDetails.getDescription());
            forum.setNiveau(forumDetails.getNiveau());
            forum.setGroupe(forumDetails.getGroupe());
            forum.setCours(forumDetails.getCours());
            forum.setStatut(forumDetails.getStatut());
            return forumRepository.save(forum);
        });
    }
    
    public boolean deleteForum(Long id) {
        return forumRepository.findById(id).map(forum -> {
            forumRepository.delete(forum);
            return true;
        }).orElse(false);
    }
    
    public Optional<Forum> fermerForum(Long id) {
        return forumRepository.findById(id).map(forum -> {
            forum.setStatut("FERME");
            return forumRepository.save(forum);
        });
    }
    
    public Optional<Forum> rouvrirForum(Long id) {
        return forumRepository.findById(id).map(forum -> {
            forum.setStatut("OUVERT");
            return forumRepository.save(forum);
        });
    }
    
    public List<Forum> getForumPlusActif() {
        Pageable pageable = PageRequest.of(0, 5);
        return forumRepository.findForumsPlusActifs(pageable);
    }
    
    public Page<Forum> rechercherForums(String titre, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return forumRepository.rechercherParTitre(titre, pageable);
    }
    
    public List<Forum> getForumsByNiveau(String niveau) {
        return forumRepository.findByNiveau(niveau);
    }
    
    public List<Forum> getForumsByStatut(String statut) {
        return forumRepository.findByStatut(statut);
    }
}
