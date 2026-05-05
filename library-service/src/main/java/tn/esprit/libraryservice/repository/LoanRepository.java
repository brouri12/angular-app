package tn.esprit.libraryservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.libraryservice.entity.Loan;

public interface LoanRepository extends JpaRepository<Loan, Long> {}
