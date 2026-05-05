package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.entity.PlayerSession;
import org.example.repository.PlayerSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages player XP, level, and progress bar.
 * XP per level = 100. Level = totalXP / 100 + 1. ProgressBar = totalXP % 100.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerSessionService {

    private static final int XP_PER_LEVEL = 100;

    private final PlayerSessionRepository repo;

    @Transactional(readOnly = true)
    public PlayerSession getOrCreate(String userId) {
        return repo.findByUserId(userId).orElseGet(() -> {
            PlayerSession s = PlayerSession.builder().userId(userId).build();
            return repo.save(s);
        });
    }

    /**
     * Award XP after a game submission. Called by SubmissionService.
     * XP = score (points earned from correct answers).
     */
    @Transactional
    public PlayerSession awardXP(String userId, int xpEarned, boolean passed) {
        PlayerSession s = getOrCreate(userId);

        int newTotalXP = s.getTotalXP() + xpEarned;
        s.setTotalXP(newTotalXP);

        // Level = floor(totalXP / 100) + 1
        int newLevel = (newTotalXP / XP_PER_LEVEL) + 1;
        // ProgressBar = XP within current level (0-99 → 0-99%)
        int newProgress = newTotalXP % XP_PER_LEVEL;

        if (newLevel > s.getLevel()) {
            log.info("🎉 Player {} leveled up: {} → {}", userId, s.getLevel(), newLevel);
        }

        s.setLevel(newLevel);
        s.setProgressBar(newProgress);
        s.setTotalGamesPlayed(s.getTotalGamesPlayed() + 1);

        if (passed) {
            s.setGamesWon(s.getGamesWon() + 1);
            int newStreak = s.getWinStreak() + 1;
            s.setWinStreak(newStreak);
            if (newStreak > s.getBestStreak()) s.setBestStreak(newStreak);
        } else {
            s.setGamesLost(s.getGamesLost() + 1);
            s.setWinStreak(0);
        }

        return repo.save(s);
    }

    @Transactional
    public PlayerSession resetSession(String userId) {
        PlayerSession s = getOrCreate(userId);
        s.setTotalXP(0);
        s.setLevel(1);
        s.setProgressBar(0);
        s.setGamesWon(0);
        s.setGamesLost(0);
        s.setTotalGamesPlayed(0);
        s.setWinStreak(0);
        return repo.save(s);
    }
}
