package com.gestions.ramzi.servicepronunciation.repositories;

import com.gestions.ramzi.servicepronunciation.entities.PronunciationChallenge;
import com.gestions.ramzi.servicepronunciation.enums.ChallengeType;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PronunciationChallengeRepository extends JpaRepository<PronunciationChallenge, Long> {

    // Find by active status
    List<PronunciationChallenge> findByActifTrue();

    // Find by niveau
    List<PronunciationChallenge> findByNiveau(NiveauCECRL niveau);

    // Find by type
    List<PronunciationChallenge> findByType(ChallengeType type);

    // Find by niveau and type
    List<PronunciationChallenge> findByNiveauAndActifTrue(NiveauCECRL niveau);

    // Find by niveau and type and actif
    List<PronunciationChallenge> findByNiveauAndTypeAndActifTrue(NiveauCECRL niveau, ChallengeType type);

    // Find active challenges with pagination
    Page<PronunciationChallenge> findByActifTrue(Pageable pageable);

    // Search by phrase containing keyword
    @Query("SELECT c FROM PronunciationChallenge c WHERE c.actif = true AND " +
           "(LOWER(c.phrase) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<PronunciationChallenge> searchByKeyword(String keyword);

    // Get most successful challenges (high average score)
    @Query("SELECT c FROM PronunciationChallenge c WHERE c.totalSubmissions > 0 " +
           "ORDER BY c.averageScore DESC")
    List<PronunciationChallenge> findMostSuccessfulChallenges(Pageable pageable);

    // Get most failed challenges (low average score)
    @Query("SELECT c FROM PronunciationChallenge c WHERE c.totalSubmissions > 0 " +
           "ORDER BY c.averageScore ASC")
    List<PronunciationChallenge> findMostFailedChallenges(Pageable pageable);

    // Get random challenge by niveau
    @Query(value = "SELECT * FROM pronunciation_challenges WHERE niveau = :niveau AND actif = true " +
           "ORDER BY RAND() LIMIT 1", nativeQuery = true)
    PronunciationChallenge findRandomByNiveau(String niveau);

    long countByActifTrue();
}

