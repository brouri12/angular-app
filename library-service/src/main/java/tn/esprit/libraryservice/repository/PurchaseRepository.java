package tn.esprit.libraryservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.libraryservice.entity.Purchase;

import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    List<Purchase> findByUserId(Long userId);
}