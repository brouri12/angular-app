package tn.esprit.challenge.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.challenge.entity.WeeklyLeaderboard;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WeeklyLeaderboardRepository extends JpaRepository<WeeklyLeaderboard, Long> {

    /** All entries for a given week, ordered by rank */
    List<WeeklyLeaderboard> findByWeekStartOrderByRankAsc(LocalDate weekStart);

    /** All distinct weeks (for history browsing) */
    List<WeeklyLeaderboard> findDistinctByOrderByWeekStartDesc();

    /** Check if a snapshot already exists for this week */
    boolean existsByWeekStart(LocalDate weekStart);

    /** Top N entries for a given week */
    List<WeeklyLeaderboard> findTop10ByWeekStartOrderByRankAsc(LocalDate weekStart);
}
