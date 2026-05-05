package tn.esprit.libraryservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.libraryservice.entity.Loan;
import tn.esprit.libraryservice.entity.LoanStatus;
import tn.esprit.libraryservice.service.LoanService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/library/loans")
public class LoanController {

    @Autowired
    private LoanService service;

    @PostMapping("/borrow/{bookId}/{userId}")
    public Loan borrow(@PathVariable Long bookId,
                       @PathVariable Long userId) {
        return service.borrow(bookId, userId);
    }

    @PostMapping("/return/{loanId}")
    public Loan returnBook(@PathVariable Long loanId) {
        return service.returnBook(loanId);
    }

    @GetMapping
    public List<Loan> all() {
        return service.getAll();
    }

    @GetMapping("/all")
    public List<Loan> getAllLoans() {
        return service.getAll();
    }

    @PutMapping("/{id}/status")
    public Loan updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LoanStatus status = LoanStatus.valueOf(body.get("status"));
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteLoan(id);
    }
}