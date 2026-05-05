package org.example.repository;

import org.example.entity.PlayerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerSessionRepository extends JpaRepository<PlayerSession, Long> {
    Optional<PlayerSession> findByUserId(String userId);
    
    long countByTotalXPGreaterThan(Integer totalXP);
    
    @Query("SELECT COUNT(ps) FROM PlayerSession ps")
    long countAllPlayers();
    
    @Query("SELECT SUM(ps.totalGamesPlayed) FROM PlayerSession ps")
    Long sumTotalGamesPlayed();
}
