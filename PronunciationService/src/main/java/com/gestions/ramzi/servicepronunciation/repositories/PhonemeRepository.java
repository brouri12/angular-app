package com.gestions.ramzi.servicepronunciation.repositories;

import com.gestions.ramzi.servicepronunciation.entities.Phoneme;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import com.gestions.ramzi.servicepronunciation.enums.PhonemeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhonemeRepository extends JpaRepository<Phoneme, Long> {

    // Find by symbol
    Optional<Phoneme> findBySymbol(String symbol);

    // Find by category
    List<Phoneme> findByCategory(PhonemeCategory category);

    // Find by typical level
    List<Phoneme> findByTypicalLevel(NiveauCECRL level);

    // Find most common problematic phonemes (basé sur usage)
    @Query("SELECT p FROM Phoneme p ORDER BY SIZE(p.exampleWords) DESC")
    List<Phoneme> findPopularPhonemes();

    // Search by name or description
    @Query("SELECT p FROM Phoneme p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Phoneme> searchByNameOrDescription(String search);

    // Get phonemes by difficulty for student level
    @Query("SELECT p FROM Phoneme p WHERE p.typicalLevel = :level")
    List<Phoneme> findByStudentLevel(NiveauCECRL level);
}
