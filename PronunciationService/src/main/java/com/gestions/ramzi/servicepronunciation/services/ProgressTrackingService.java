package com.gestions.ramzi.servicepronunciation.services;

import com.gestions.ramzi.servicepronunciation.dto.ProgressDTO;
import com.gestions.ramzi.servicepronunciation.entities.UserProgress;
import com.gestions.ramzi.servicepronunciation.entities.UserRecording;
import com.gestions.ramzi.servicepronunciation.enums.BadgeType;
import com.gestions.ramzi.servicepronunciation.enums.NiveauCECRL;
import com.gestions.ramzi.servicepronunciation.repositories.UserProgressRepository;
import com.gestions.ramzi.servicepronunciation.repositories.UserRecordingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProgressTrackingService {

    private final UserProgressRepository progressRepository;
    private final UserRecordingRepository recordingRepository;

    /**
     * Obtenir ou créer la progression d'un utilisateur
     */
    public UserProgress getOrCreateUserProgress(Long userId) {
        return progressRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProgress progress = UserProgress.builder()
                            .userId(userId)
                            .build();
                    return progressRepository.save(progress);
                });
    }

    /**
     * Mettre à jour progression après enregistrement
     */
    public void updateUserProgress(Long userId, UserRecording recording) {
        UserProgress progress = getOrCreateUserProgress(userId);
        
        updateStatsFromRecording(progress, recording);
        updateStreak(progress);
        checkBadges(progress);
        
        progressRepository.save(progress);
        log.info("Updated progress for user {} - score: {}", userId, recording.getOverallScore());
    }

    private void updateStatsFromRecording(UserProgress progress, UserRecording recording) {
        NiveauCECRL niveau = recording.getChallenge().getNiveau();
        
        // Mettre à jour total
        progress.setTotalRecordings(progress.getTotalRecordings() + 1);
        if (recording.getOverallScore() > 50) {
            progress.setTotalChallengesCompleted(progress.getTotalChallengesCompleted() + 1);
        }

        // Mettre à jour moyenne globale
        double newGlobalAvg = ((progress.getGlobalAverageScore() * (progress.getTotalRecordings() - 1)) 
                              + recording.getOverallScore()) / progress.getTotalRecordings();
        progress.setGlobalAverageScore(newGlobalAvg);

        // Mettre à jour moyenne par niveau
        switch (niveau) {
            case A1 -> progress.setAverageScoreA1(updateLevelAvg(progress.getAverageScoreA1(), recording.getOverallScore()));
            case A2 -> progress.setAverageScoreA2(updateLevelAvg(progress.getAverageScoreA2(), recording.getOverallScore()));
            case B1 -> progress.setAverageScoreB1(updateLevelAvg(progress.getAverageScoreB1(), recording.getOverallScore()));
            case B2 -> progress.setAverageScoreB2(updateLevelAvg(progress.getAverageScoreB2(), recording.getOverallScore()));
            case C1 -> progress.setAverageScoreC1(updateLevelAvg(progress.getAverageScoreC1(), recording.getOverallScore()));
            case C2 -> progress.setAverageScoreC2(updateLevelAvg(progress.getAverageScoreC2(), recording.getOverallScore()));
        }

        // Estimer niveau actuel
        progress.setEstimatedLevel(estimateLevel(progress));
    }

    private double updateLevelAvg(double currentAvg, double newScore) {
        if (currentAvg == 0) return newScore;
        return (currentAvg + newScore) / 2;
    }

    private NiveauCECRL estimateLevel(UserProgress progress) {
        double global = progress.getGlobalAverageScore();
        if (global > 85) return NiveauCECRL.C1;
        if (global > 75) return NiveauCECRL.B2;
        if (global > 65) return NiveauCECRL.B1;
        if (global > 50) return NiveauCECRL.A2;
        return NiveauCECRL.A1;
    }

    /**
     * Mettre à jour streak
     */
    private void updateStreak(UserProgress progress) {
        LocalDate today = LocalDate.now();
        progress.setLastActivityDate(LocalDateTime.now());
        
        // TODO: Vérifier si enregistrement aujourd'hui pour streak
        int currentStreak = progress.getCurrentStreak() + 1;
        progress.setCurrentStreak(currentStreak);
        
        if (currentStreak > progress.getBestStreak()) {
            progress.setBestStreak(currentStreak);
        }
    }

    /**
     * Vérifier et attribuer badges
     */
    private void checkBadges(UserProgress progress) {
        List<BadgeType> badges = progress.getEarnedBadges();
        if (badges == null) badges = new ArrayList<>();

        // Perfect Master (10 PERFECT)
        if (progress.getTotalRecordings() >= 10 && !badges.contains(BadgeType.PERFECT_MASTER)) {
            badges.add(BadgeType.PERFECT_MASTER);
        }

        // Streak King
        if (progress.getBestStreak() >= 7 && !badges.contains(BadgeType.STREAK_KING)) {
            badges.add(BadgeType.STREAK_KING);
        }

        // Centurion (100 recordings)
        if (progress.getTotalRecordings() >= 100 && !badges.contains(BadgeType.CENTURION)) {
            badges.add(BadgeType.CENTURION);
        }

        // Golden Tongue (>90% avg)
        if (progress.getGlobalAverageScore() >= 90 && !badges.contains(BadgeType.GOLDEN_TONGUE)) {
            badges.add(BadgeType.GOLDEN_TONGUE);
        }

        progress.setEarnedBadges(badges);
        // Award XP
        progress.setXp(progress.getXp() + (int)(progress.getGlobalAverageScore() * 10));
    }

    /**
     * Obtenir progression utilisateur
     */
    public ProgressDTO getUserProgress(Long userId) {
        UserProgress progress = getOrCreateUserProgress(userId);

        return ProgressDTO.builder()
                .userId(userId)
                .globalAverageScore(progress.getGlobalAverageScore())
                .scoresByNiveau(Map.of(
                    NiveauCECRL.A1, progress.getAverageScoreA1() != null ? progress.getAverageScoreA1() : 0.0,
                    NiveauCECRL.A2, progress.getAverageScoreA2() != null ? progress.getAverageScoreA2() : 0.0,
                    NiveauCECRL.B1, progress.getAverageScoreB1() != null ? progress.getAverageScoreB1() : 0.0,
                    NiveauCECRL.B2, progress.getAverageScoreB2() != null ? progress.getAverageScoreB2() : 0.0,
                    NiveauCECRL.C1, progress.getAverageScoreC1() != null ? progress.getAverageScoreC1() : 0.0,
                    NiveauCECRL.C2, progress.getAverageScoreC2() != null ? progress.getAverageScoreC2() : 0.0
                ))
                .totalChallengesCompleted(progress.getTotalChallengesCompleted())
                .totalRecordings(progress.getTotalRecordings())
                .currentStreak(progress.getCurrentStreak())
                .bestStreak(progress.getBestStreak())
                .weakPhonemes(progress.getWeakPhonemes() != null ? progress.getWeakPhonemes() : List.of())
                .badges(progress.getEarnedBadges())
                .estimatedLevel(progress.getEstimatedLevel())
                .lastActivityDate(progress.getLastActivityDate())
                .xp(progress.getXp())
                .build();
    }

    /**
     * Leaderboard par niveau
     */
    public List<UserProgress> getLeaderboard(NiveauCECRL niveau, int limit) {
        return progressRepository.findByEstimatedLevel(niveau)
                .stream()
                .sorted((a, b) -> Double.compare(b.getGlobalAverageScore(), a.getGlobalAverageScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }
}

