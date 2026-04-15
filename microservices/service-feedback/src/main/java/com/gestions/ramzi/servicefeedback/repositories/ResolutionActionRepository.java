package com.gestions.ramzi.servicefeedback.repositories;

import com.gestions.ramzi.servicefeedback.entities.ResolutionAction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResolutionActionRepository extends JpaRepository<ResolutionAction, Long> {
    java.util.List<ResolutionAction> findByReclamation_Id(Long reclamationId);
}
