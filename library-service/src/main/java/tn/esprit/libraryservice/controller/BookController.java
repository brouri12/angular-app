package tn.esprit.libraryservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.esprit.libraryservice.entity.Book;
import tn.esprit.libraryservice.service.BookService;

import java.util.List;

@RestController
@RequestMapping("/library/books")
public class BookController {

    @Autowired
    private BookService service;

    @PostMapping
    public Book save(@RequestBody Book b) {
        return service.save(b);
    }

    @GetMapping
    public List<Book> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Book one(@PathVariable Long id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}