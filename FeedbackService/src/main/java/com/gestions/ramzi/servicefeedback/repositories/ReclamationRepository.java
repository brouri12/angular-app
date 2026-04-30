package com.gestions.ramzi.servicefeedback.repositories;

import com.gestions.ramzi.servicefeedback.entities.Reclamation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    java.util.List<Reclamation> findByUserId(Long userId);
    java.util.List<Reclamation> findByStatus(String status);
}
