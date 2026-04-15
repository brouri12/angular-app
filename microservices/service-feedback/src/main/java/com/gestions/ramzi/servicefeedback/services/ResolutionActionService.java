package com.gestions.ramzi.servicefeedback.services;

import com.gestions.ramzi.servicefeedback.entities.ResolutionAction;
import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import com.gestions.ramzi.servicefeedback.repositories.ResolutionActionRepository;
import com.gestions.ramzi.servicefeedback.repositories.ReclamationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResolutionActionService {

    private final ResolutionActionRepository repository;
    private final ReclamationRepository reclamationRepository;

    public ResolutionActionService(ResolutionActionRepository repository, ReclamationRepository reclamationRepository) {
        this.repository = repository;
        this.reclamationRepository = reclamationRepository;
    }

    public List<ResolutionAction> getAll() {
        return repository.findAll();
    }

    public ResolutionAction getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public ResolutionAction create(ResolutionAction action) {
        if (action.getReclamationId() != null) {
            Reclamation reclamation = reclamationRepository.findById(action.getReclamationId())
                    .orElseThrow(() -> new IllegalArgumentException("Reclamation not found: " + action.getReclamationId()));
            action.setReclamation(reclamation);
        }
        action.setDateAction(LocalDateTime.now());
        return repository.save(action);
    }

    public ResolutionAction update(Long id, ResolutionAction updated) {
        ResolutionAction existing = getById(id);
        if (existing != null) {
            existing.setAction(updated.getAction());
            existing.setResponsable(updated.getResponsable());
            return repository.save(existing);
        }
        return null;
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public List<ResolutionAction> getByReclamationId(Long reclamationId) {
        return repository.findByReclamation_Id(reclamationId);
    }
}
