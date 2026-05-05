package tn.esprit.libraryservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.libraryservice.entity.Book;


public interface BookRepository extends JpaRepository<Book, Long> {}