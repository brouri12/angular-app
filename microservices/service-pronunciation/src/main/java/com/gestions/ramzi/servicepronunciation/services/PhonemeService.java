package com.gestions.ramzi.servicepronunciation.services;

import com.gestions.ramzi.servicepronunciation.entities.Phoneme;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import com.gestions.ramzi.servicepronunciation.enums.PhonemeCategory;
import com.gestions.ramzi.servicepronunciation.repositories.PhonemeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PhonemeService {

    private final PhonemeRepository phonemeRepository;

    /**
     * Obtenir tous les phonèmes
     */
    public List<Phoneme> getAllPhonemes() {
        return phonemeRepository.findAll();
    }

    /**
     * Obtenir phonème par symbole
     */
    public Optional<Phoneme> getPhonemeBySymbol(String symbol) {
        return phonemeRepository.findBySymbol(symbol);
    }

    /**
     * Obtenir phonèmes par catégorie
     */
    public List<Phoneme> getPhonemesByCategory(PhonemeCategory category) {
        return phonemeRepository.findByCategory(category);
    }

    /**
     * Obtenir phonèmes par niveau
     */
    public List<Phoneme> getPhonemesByNiveau(NiveauCECRL niveau) {
        return phonemeRepository.findByTypicalLevel(niveau);
    }

    /**
     * Phonèmes populaires (plus d'exemples)
     */
    public List<Phoneme> getPopularPhonemes(int limit) {
        return phonemeRepository.findPopularPhonemes()
                .stream()
                .limit(limit)
                .toList();
    }

    /**
     * Rechercher phonèmes
     */
    public List<Phoneme> searchPhonemes(String query) {
        return phonemeRepository.searchByNameOrDescription(query);
    }

    /**
     * Suggestions pour un niveau d'étudiant
     */
    public List<Phoneme> getSuggestedPhonemesForLevel(NiveauCECRL level) {
        return phonemeRepository.findByStudentLevel(level);
    }

    /**
     * Phonèmes problématiques fréquents (sons anglais difficiles)
     */
public List<Phoneme> getCommonProblematicPhonemes() {
        return List.of("THETA", "ETH", "R", "L").stream() // Basé sur /θ/, /ð/, /r/, /l/
                .map(s -> phonemeRepository.findBySymbol(s).orElse(null))
                .filter(p -> p != null)
                .toList();
    }
}


