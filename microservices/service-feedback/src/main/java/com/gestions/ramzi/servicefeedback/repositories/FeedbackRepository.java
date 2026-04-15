package com.gestions.ramzi.servicefeedback.repositories;

import com.gestions.ramzi.servicefeedback.entities.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    java.util.List<Feedback> findByUserId(Long userId);
    java.util.List<Feedback> findByModuleId(Long moduleId);
}
