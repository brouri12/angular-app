package tn.esprit.libraryservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.libraryservice.entity.Book;
import tn.esprit.libraryservice.entity.BookType;
import tn.esprit.libraryservice.entity.PaymentStatus;
import tn.esprit.libraryservice.entity.Purchase;
import tn.esprit.libraryservice.repository.BookRepository;
import tn.esprit.libraryservice.repository.PurchaseRepository;


import java.time.LocalDate;
import java.util.List;

@Service
public class MarketplaceService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private BookRepository bookRepository;

    public Purchase buyPdf(Long userId, Long bookId) {

        // check if already bought
        if (purchaseRepository.existsByUserIdAndBookId(userId, bookId)) {
            throw new RuntimeException("Book already purchased");
        }

        Book book = bookRepository.findById(bookId).orElseThrow();

        if (book.getBookType() != BookType.PDF) {
            throw new RuntimeException("Only PDF books can be purchased");
        }

        Purchase p = new Purchase();
        p.setUserId(userId);
        p.setBookId(bookId);
        p.setPrice(book.getPrice());
        p.setPurchaseDate(LocalDate.now());
        p.setPaymentStatus(PaymentStatus.PAID);

        return purchaseRepository.save(p);
    }

    public List<Purchase> myPurchases(Long userId) {
        return purchaseRepository.findByUserId(userId);
    }

    public List<Purchase> allPurchases() {
        return purchaseRepository.findAll();
    }

    public void deletePurchase(Long id) {
        purchaseRepository.deleteById(id);
    }

    public Purchase updateStatus(Long id, String status) {
        Purchase p = purchaseRepository.findById(id).orElseThrow();
        p.setPaymentStatus(PaymentStatus.valueOf(status));
        return purchaseRepository.save(p);
    }
}
