package tn.esprit.challenge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.esprit.challenge.entity.Challenge;
import tn.esprit.challenge.enums.ChallengeType;
import tn.esprit.challenge.enums.ProficiencyLevel;
import tn.esprit.challenge.enums.SkillFocus;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    
    // Find by proficiency level
    List<Challenge> findByLevel(ProficiencyLevel level);
    
    // Find by challenge type
    List<Challenge> findByType(ChallengeType type);
    
    // Find by skill focus
    List<Challenge> findBySkillFocus(SkillFocus skillFocus);
    
    // Find public challenges
    List<Challenge> findByIsPublicTrue();
    
    // Find by level and type
    List<Challenge> findByLevelAndType(ProficiencyLevel level, ChallengeType type);
    
    // Find by category
    List<Challenge> findByCategory(String category);
    
    // Find by creator
    List<Challenge> findByCreatedBy(Long createdBy);
    
    // Search by title or description
    @Query("SELECT c FROM Challenge c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Challenge> searchByKeyword(String keyword);
    
    // Get popular challenges (most attempts)
    List<Challenge> findTop10ByOrderByTotalAttemptsDesc();
    
    // Get highly rated challenges
    List<Challenge> findByAverageRatingGreaterThanEqualOrderByAverageRatingDesc(Double minRating);
}
