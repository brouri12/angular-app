package tn.esprit.libraryservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.libraryservice.entity.Book;
import tn.esprit.libraryservice.repository.BookRepository;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Book save(Book b) {
        // Enforce: availableCopies cannot exceed totalCopies
        if (b.getTotalCopies() < 0) {
            b.setTotalCopies(0);
        }
        if (b.getAvailableCopies() < 0) {
            b.setAvailableCopies(0);
        }
        if (b.getAvailableCopies() > b.getTotalCopies()) {
            b.setAvailableCopies(b.getTotalCopies());
        }
        return bookRepository.save(b);
    }

    public List<Book> findAll() {
        return bookRepository.findAll();
    }

    public Book findById(Long id) {
        return bookRepository.findById(id).orElseThrow();
    }

    public void delete(Long id) {
        bookRepository.deleteById(id);
    }
}