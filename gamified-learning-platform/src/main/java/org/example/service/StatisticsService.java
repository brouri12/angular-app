package org.example.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.dto.GlobalStatsDTO;
import org.example.dto.UserRankDTO;
import org.example.dto.UserStatsDTO;
import org.example.entity.PlayerSession;
import org.example.entity.Submission;
import org.example.repository.GameRepository;
import org.example.repository.PlayerSessionRepository;
import org.example.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final SubmissionRepository submissionRepository;
    private final PlayerSessionRepository sessionRepository;
    private final GameRepository gameRepository;

    @Transactional(readOnly = true)
    public UserStatsDTO getUserStats(String userId) {
        List<Submission> submissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        PlayerSession session = sessionRepository.findByUserId(userId).orElse(null);

        int total = submissions.size();
        int passed = (int) submissions.stream().filter(s -> "PASSED".equals(s.getStatus())).count();
        int failed = (int) submissions.stream().filter(s -> "FAILED".equals(s.getStatus())).count();
        int totalScore = submissions.stream().mapToInt(s -> s.getScore() != null ? s.getScore() : 0).sum();

        double passRate = total > 0 ? (passed * 100.0 / total) : 0;
        double accuracy = submissions.stream()
            .filter(s -> s.getTotalQuestions() != null && s.getTotalQuestions() > 0)
            .mapToDouble(s -> s.getPercentage())
            .average().orElse(0);

        return UserStatsDTO.builder()
            .userId(userId)
            .totalScore(totalScore)
            .totalGamesPlayed(total)
            .totalGamesPassed(passed)
            .totalGamesFailed(failed)
            .passRate(Math.round(passRate * 10.0) / 10.0)
            .overallAccuracy(Math.round(accuracy * 10.0) / 10.0)
            .currentStreak(session != null ? session.getWinStreak() : 0)
            .bestStreak(session != null ? session.getBestStreak() : 0)
            .level(session != null ? session.getLevel() : 1)
            .progressBar(session != null ? session.getProgressBar() : 0)
            .totalXP(session != null ? session.getTotalXP() : 0)
            .build();
    }

    @Transactional(readOnly = true)
    public List<UserRankDTO> getLeaderboard(int limit) {
        List<PlayerSession> sessions = sessionRepository.findAll();

        AtomicInteger rank = new AtomicInteger(1);
        return sessions.stream()
            .sorted(Comparator.comparingInt(PlayerSession::getTotalXP).reversed())
            .limit(limit)
            .map(s -> {
                List<Submission> subs = submissionRepository.findByUserIdOrderBySubmittedAtDesc(s.getUserId());
                int total = subs.size();
                int passed = (int) subs.stream().filter(sub -> "PASSED".equals(sub.getStatus())).count();
                double passRate = total > 0 ? (passed * 100.0 / total) : 0;

                return UserRankDTO.builder()
                    .rank(rank.getAndIncrement())
                    .userId(s.getUserId())
                    .totalScore(s.getTotalXP())
                    .gamesPassed(s.getGamesWon())
                    .passRate(Math.round(passRate * 10.0) / 10.0)
                    .level(s.getLevel())
                    .winStreak(s.getWinStreak())
                    .build();
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GlobalStatsDTO getGlobalStats() {
        long totalGames = gameRepository.count();
        long totalSubmissions = submissionRepository.count();
        long totalPlayers = sessionRepository.count();

        List<Submission> all = submissionRepository.findAll();
        long passed = all.stream().filter(s -> "PASSED".equals(s.getStatus())).count();
        double passRate = totalSubmissions > 0 ? (passed * 100.0 / totalSubmissions) : 0;
        double avgScore = all.stream()
            .mapToInt(s -> s.getScore() != null ? s.getScore() : 0)
            .average().orElse(0);

        return GlobalStatsDTO.builder()
            .totalGames(totalGames)
            .totalSubmissions(totalSubmissions)
            .totalPlayers(totalPlayers)
            .globalPassRate(Math.round(passRate * 10.0) / 10.0)
            .globalAverageScore(Math.round(avgScore * 10.0) / 10.0)
            .leaderboard(getLeaderboard(10))
            .build();
    }
}
