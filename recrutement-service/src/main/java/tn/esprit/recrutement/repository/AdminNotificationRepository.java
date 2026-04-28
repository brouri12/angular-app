package tn.esprit.recrutement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.recrutement.entity.AdminNotification;

import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findByLuFalseOrderByCreatedAtDesc();
    List<AdminNotification> findAllByOrderByCreatedAtDesc();
}
