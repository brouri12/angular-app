package tn.esprit.challenge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.challenge.entity.Hint;

import java.util.List;

@Repository
public interface HintRepository extends JpaRepository<Hint, Long> {
    
    // Find all hints for a challenge, ordered by level
    List<Hint> findByChallengeIdOrderByLevelAsc(Long challengeId);
    
    // Find hint by challenge and level
    Hint findByChallengeIdAndLevel(Long challengeId, Integer level);
}
