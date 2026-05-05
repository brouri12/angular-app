package tn.esprit.libraryservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.libraryservice.entity.Book;
import tn.esprit.libraryservice.entity.Loan;
import tn.esprit.libraryservice.entity.LoanStatus;
import tn.esprit.libraryservice.repository.BookRepository;
import tn.esprit.libraryservice.repository.LoanRepository;

import java.time.LocalDate;
import java.util.List;


@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private BookRepository bookRepository;

    public Loan borrow(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId).orElseThrow();

        if (book.getAvailableCopies() <= 0)
            throw new RuntimeException("Not available");

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan l = new Loan();
        l.setBookId(bookId);
        l.setUserId(userId);
        l.setLoanDate(LocalDate.now());
        l.setLoanStatus(LoanStatus.BORROWED);

        return loanRepository.save(l);
    }

    public Loan returnBook(Long loanId) {
        Loan l = loanRepository.findById(loanId).orElseThrow();
        l.setLoanStatus(LoanStatus.RETURNED);
        l.setReturnDate(LocalDate.now());

        Book b = bookRepository.findById(l.getBookId()).orElseThrow();
        b.setAvailableCopies(b.getAvailableCopies() + 1);
        bookRepository.save(b);

        return loanRepository.save(l);
    }

    public List<Loan> getAll() {
        return loanRepository.findAll();
    }

    public Loan updateStatus(Long loanId, LoanStatus newStatus) {
        Loan loan = loanRepository.findById(loanId).orElseThrow();
        LoanStatus oldStatus = loan.getLoanStatus();

        if (oldStatus == newStatus) return loan;

        // If changing to RETURNED, handle return logic (set date + restore copy)
        if (newStatus == LoanStatus.RETURNED && oldStatus != LoanStatus.RETURNED) {
            loan.setReturnDate(LocalDate.now());
            Book book = bookRepository.findById(loan.getBookId()).orElseThrow();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
        }
        // If changing FROM RETURNED to something else, reverse the return
        else if (oldStatus == LoanStatus.RETURNED && newStatus != LoanStatus.RETURNED) {
            loan.setReturnDate(null);
            Book book = bookRepository.findById(loan.getBookId()).orElseThrow();
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepository.save(book);
        }

        loan.setLoanStatus(newStatus);
        return loanRepository.save(loan);
    }

    public void deleteLoan(Long id) {
        loanRepository.deleteById(id);
    }
}
