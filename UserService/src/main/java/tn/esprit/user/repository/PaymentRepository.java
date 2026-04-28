package tn.esprit.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.user.entity.Payment;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByStatut(String statut);
    
    List<Payment> findByIdUser(Long idUser);
    
    List<Payment> findByMethodePaiement(String methodePaiement);
    
    List<Payment> findByStatutOrderByDatePaiementDesc(String statut);
}
