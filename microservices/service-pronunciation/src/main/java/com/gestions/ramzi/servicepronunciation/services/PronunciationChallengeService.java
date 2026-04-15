package com.gestions.ramzi.servicepronunciation.services;

import com.gestions.ramzi.servicepronunciation.entities.PronunciationChallenge;
import com.gestions.ramzi.servicepronunciation.enums.ChallengeType;
import com.gestions.ramzi.servicepronunciation.enums.DifficultyLevel;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import com.gestions.ramzi.servicepronunciation.repositories.PronunciationChallengeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PronunciationChallengeService {

    private final PronunciationChallengeRepository challengeRepository;
    private final RecordingService recordingService;


    /**
     * Créer un nouveau défi de prononciation
     */
    public PronunciationChallenge createChallenge(PronunciationChallenge challenge) {
        log.info("Creating new pronunciation challenge: {}", challenge.getPhrase());
        challenge.setDatePosted(LocalDateTime.now());
        challenge.setActif(true);
        challenge.setTotalSubmissions(0);
        challenge.setAverageScore(0.0);
        
        if (challenge.getDifficulty() == null) {
            challenge.setDifficulty(DifficultyLevel.MEDIUM);
        }
        
        return challengeRepository.save(challenge);
    }

    /**
     * Obtenir un défi par ID
     */
    @Transactional(readOnly = true)
    public Optional<PronunciationChallenge> getChallengeById(Long id) {
        return challengeRepository.findById(id);
    }

    /**
     * Obtenir tous les défis actifs
     */
    @Transactional(readOnly = true)
    public List<PronunciationChallenge> getAllActiveChallenges() {
        return challengeRepository.findByActifTrue();
    }

    /**
     * Obtenir tous les défis avec pagination
     */
    @Transactional(readOnly = true)
    public Page<PronunciationChallenge> getAllChallenges(Pageable pageable) {
        return challengeRepository.findByActifTrue(pageable);
    }

    /**
     * Obtenir un défi aléatoire par niveau
     */
    @Transactional(readOnly = true)
    public Optional<PronunciationChallenge> getRandomChallengeByNiveau(NiveauCECRL niveau) {
        try {
            PronunciationChallenge challenge = challengeRepository.findRandomByNiveau(niveau.name());
            return Optional.ofNullable(challenge);
        } catch (Exception e) {
            log.warn("Error getting random challenge: {}", e.getMessage());
            return challengeRepository.findByNiveauAndActifTrue(niveau)
                    .stream()
                    .findAny();
        }
    }

    /**
     * Mettre à jour un défi
     */
    public PronunciationChallenge updateChallenge(Long id, PronunciationChallenge updatedChallenge) {
        PronunciationChallenge existing = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found with id: " + id));

        existing.setPhrase(updatedChallenge.getPhrase());
        existing.setNiveau(updatedChallenge.getNiveau());
        existing.setType(updatedChallenge.getType());
        existing.setDescription(updatedChallenge.getDescription());
        existing.setPhoneticTranscription(updatedChallenge.getPhoneticTranscription());
        existing.setAudioReferenceUrl(updatedChallenge.getAudioReferenceUrl());
        existing.setKeywords(updatedChallenge.getKeywords());
        existing.setTips(updatedChallenge.getTips());
        existing.setDifficulty(updatedChallenge.getDifficulty());

        return challengeRepository.save(existing);
    }

    /**
     * Supprimer (désactiver) un défi
     */
    public void deleteChallenge(Long id) {
        PronunciationChallenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found with id: " + id));
        challenge.setActif(false);
        challengeRepository.save(challenge);
    }

    /**
     * Supprimer définitivement un défi
     */
    public void hardDeleteChallenge(Long id) {
        challengeRepository.deleteById(id);
    }

    /**
     * Obtenir les défis par niveau
     */
    @Transactional(readOnly = true)
    public List<PronunciationChallenge> getChallengesByNiveau(NiveauCECRL niveau) {
        return challengeRepository.findByNiveau(niveau);
    }

    /**
     * Obtenir les défis par type
     */
    @Transactional(readOnly = true)
    public List<PronunciationChallenge> getChallengesByType(ChallengeType type) {
        return challengeRepository.findByType(type);
    }

    /**
     * Rechercher des défis par mot-clé
     */
    @Transactional(readOnly = true)
    public List<PronunciationChallenge> searchChallenges(String keyword) {
        return challengeRepository.searchByKeyword(keyword);
    }

    /**
     * Obtenir les défis les plus réussis
     */
    @Transactional(readOnly = true)
    public List<PronunciationChallenge> getMostSuccessfulChallenges(int limit) {
        return challengeRepository.findMostSuccessfulChallenges(Pageable.ofSize(limit));
    }

    /**
     * Obtenir les défis les plus échoués
     */
    @Transactional(readOnly = true)
    public List<PronunciationChallenge> getMostFailedChallenges(int limit) {
        return challengeRepository.findMostFailedChallenges(Pageable.ofSize(limit));
    }

    /**
     * Mettre à jour les statistiques d'un défi
     */
    public void updateChallengeStats(Long challengeId, Double newScore) {
        PronunciationChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        int total = challenge.getTotalSubmissions() + 1;
        double oldAvg = challenge.getAverageScore();
        
        // Calculate new average
        double newAvg = ((oldAvg * challenge.getTotalSubmissions()) + newScore) / total;
        
        challenge.setTotalSubmissions(total);
        challenge.setAverageScore(newAvg);
        
        challengeRepository.save(challenge);
    }

    /**
     * Créer des défis par défaut pour les tests
     */
    public void createDefaultChallenges() {
        if (challengeRepository.count() == 0) {
            log.info("Creating default pronunciation challenges");
            
            // A1 Level Challenges
            createChallenge(PronunciationChallenge.builder()
                    .phrase("Hello, how are you?")
                    .niveau(NiveauCECRL.A1)
                    .type(ChallengeType.PHRASE)
                    .description("Basic greeting")
                    .phoneticTranscription("/həˈlaʊ haʊ ɑːr juː/")
                    .difficulty(DifficultyLevel.EASY)
                    .tips("Practice the 'h' sound and the 'ou' sound")
                    .build());

            createChallenge(PronunciationChallenge.builder()
                    .phrase("My name is John.")
                    .niveau(NiveauCECRL.A1)
                    .type(ChallengeType.PHRASE)
                    .description("Introducing yourself")
                    .phoneticTranscription("/maɪ neɪm ɪz dʒɒn/")
                    .difficulty(DifficultyLevel.EASY)
                    .tips("Focus on the 'ay' sound in 'name'")
                    .build());

            // A2 Level Challenges
            createChallenge(PronunciationChallenge.builder()
                    .phrase("The weather is nice today.")
                    .niveau(NiveauCECRL.A2)
                    .type(ChallengeType.PHRASE)
                    .description("Talking about weather")
                    .phoneticTranscription("/ðə ˈweðər ɪz naɪs təˈdeɪ/")
                    .difficulty(DifficultyLevel.MEDIUM)
                    .tips("Pay attention to the 'th' sound")
                    .build());

            createChallenge(PronunciationChallenge.builder()
                    .phrase("I would like a cup of coffee, please.")
                    .niveau(NiveauCECRL.A2)
                    .type(ChallengeType.PHRASE)
                    .description("Ordering at a café")
                    .phoneticTranscription("/aɪ wʊd laɪk ə kʌp əv ˈkɒfi pliːz/")
                    .difficulty(DifficultyLevel.MEDIUM)
                    .tips("Practice the 'w' and 'l' sounds")
                    .build());

            // B1 Level Challenges
            createChallenge(PronunciationChallenge.builder()
                    .phrase("Think before you speak.")
                    .niveau(NiveauCECRL.B1)
                    .type(ChallengeType.PHRASE)
                    .description("Common expression")
                    .phoneticTranscription("/θɪŋk bɪˈfɔːr juː spiːk/")
                    .difficulty(DifficultyLevel.MEDIUM)
                    .tips("The 'th' sound at the beginning of 'think'")
                    .build());

            createChallenge(PronunciationChallenge.builder()
                    .phrase("She sells seashells by the seashore.")
                    .niveau(NiveauCECRL.B1)
                    .type(ChallengeType.PHRASE)
                    .description("Tongue twister")
                    .phoneticTranscription("/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/")
                    .difficulty(DifficultyLevel.HARD)
                    .tips("Challenge yourself with the 's' and 'sh' sounds")
                    .build());

            // B2 Level Challenges
            createChallenge(PronunciationChallenge.builder()
                    .phrase("Through three three-thousand thermometers.")
                    .niveau(NiveauCECRL.B2)
                    .type(ChallengeType.PHRASE)
                    .description("Advanced tongue twister")
                    .phoneticTranscription("/θruː θriː θrɪˈθaʊzənd θəˈrɒmɪtərz/")
                    .difficulty(DifficultyLevel.EXPERT)
                    .tips("Focus on the 'th' sound variations")
                    .build());

            createChallenge(PronunciationChallenge.builder()
                    .phrase("The thirty-three thieves think they are the best thieves.")
                    .niveau(NiveauCECRL.B2)
                    .type(ChallengeType.PHRASE)
                    .description("Complex tongue twister")
                    .phoneticTranscription("/ðə ˈθɜːrti θriː θiːvz θɪŋk ðeɪ ɑːr ðə bɛst θiːvz/")
                    .difficulty(DifficultyLevel.EXPERT)
                    .tips("Master the 'th' sound in different positions")
                    .build());

            log.info("Default challenges created successfully");
        }
    }
    /**
     * Compter le nombre total de défis
     */
    @Transactional(readOnly = true)
    public long countAllChallenges() {
        return challengeRepository.count();
    }

    /**
     * Compter le nombre de défis actifs
     */
    @Transactional(readOnly = true)
    public long countActiveChallenges() {
        return challengeRepository.countByActifTrue();
    }

    /**
     * Statistiques globales pour le dashboard admin
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getGlobalAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalChallenges = countAllChallenges();
        long totalActiveChallenges = countActiveChallenges();
        long totalRecordings = recordingService.getAll().size();
        stats.put("totalChallenges", totalChallenges);
        stats.put("totalActiveChallenges", totalActiveChallenges);
        stats.put("totalRecordings", totalRecordings);
        stats.put("averageScore", 0.0);
        stats.put("totalStudents", 0);
        stats.put("lastUpdated", LocalDateTime.now());

        log.info("Global admin stats calculated - Total challenges: {}, Active: {}",
                totalChallenges, totalActiveChallenges);

        return stats;
    }

}

