package tn.esprit.challenge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.challenge.entity.Question;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    // Find all questions for a challenge, ordered by orderIndex
    List<Question> findByChallengeIdOrderByOrderIndexAsc(Long challengeId);
    
    // Count questions in a challenge
    Long countByChallengeId(Long challengeId);
}
