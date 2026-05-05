package tn.esprit.libraryservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.libraryservice.entity.Purchase;
import tn.esprit.libraryservice.service.MarketplaceService;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/library/marketplace")
public class MarketplaceController {

    @Autowired
    private MarketplaceService service;

    @PostMapping("/buy/{bookId}/{userId}")
    public ResponseEntity<?> buy(@PathVariable Long bookId,
                                  @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(service.buyPdf(userId, bookId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-purchases/{userId}")
    public List<Purchase> myPurchases(@PathVariable Long userId) {
        return service.myPurchases(userId);
    }

    @GetMapping("/purchases")
    public List<Purchase> all() {
        return service.allPurchases();
    }

    @DeleteMapping("/purchases/{id}")
    public void delete(@PathVariable Long id) {
        service.deletePurchase(id);
    }

    @PutMapping("/purchases/{id}/status")
    public Purchase updateStatus(@PathVariable Long id,
                                  @RequestBody java.util.Map<String, String> body) {
        return service.updateStatus(id, body.get("status"));
    }
}