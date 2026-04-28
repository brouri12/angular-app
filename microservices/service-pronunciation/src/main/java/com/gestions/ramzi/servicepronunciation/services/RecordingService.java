package com.gestions.ramzi.servicepronunciation.services;

import com.gestions.ramzi.servicepronunciation.dto.AudioAnalysisResult;
import com.gestions.ramzi.servicepronunciation.entities.PronunciationChallenge;
import com.gestions.ramzi.servicepronunciation.entities.UserRecording;
import com.gestions.ramzi.servicepronunciation.enums.CollectionType;
import com.gestions.ramzi.servicepronunciation.enums.RecordingStatus;
import com.gestions.ramzi.servicepronunciation.repositories.PronunciationChallengeRepository;
import com.gestions.ramzi.servicepronunciation.repositories.RecordingCollectionRepository;
import com.gestions.ramzi.servicepronunciation.entities.RecordingCollection;
import com.gestions.ramzi.servicepronunciation.repositories.UserRecordingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecordingService {

    private final UserRecordingRepository recordingRepository;
    private final PronunciationChallengeRepository challengeRepository;
    private final AudioStorageService audioStorageService;
    private final AIService aiService;
    private final RecordingCollectionRepository recordingCollectionRepository;
    private final ProgressTrackingService progressService;

    private static final String UPLOAD_DIR = "uploads/pronunciation/";

    public UserRecording submitRecording(Long challengeId, Long userId, MultipartFile audioFile) {
        log.info("Submitting recording for challenge {} by user {}", challengeId, userId);

        PronunciationChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        Long attemptCount = recordingRepository.countByUserIdAndChallengeId(userId, challengeId);
        int attemptNumber = (int) (attemptCount + 1);

        String filename = audioStorageService.storeAudioFile(audioFile);
        String audioUrl = "/api/pronunciation/audio/" + filename;

        UserRecording recording = UserRecording.builder()
                .challenge(challenge)
                .userId(userId)
                .audioUrl(audioUrl)
                .audioStoragePath(filename)
                .status(RecordingStatus.PROCESSING)
                .attemptNumber(attemptNumber)
                .submittedAt(LocalDateTime.now())
                .build();

        UserRecording saved = recordingRepository.save(recording);

        String expectedText = challenge.getPhrase();

        analyzeRecordingAsync(saved.getId(), filename, expectedText);

        return saved;
    }

    public UserRecording updateRecording(Long id, MultipartFile newAudioFile) {
        UserRecording recording = recordingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recording not found"));

        String filename = audioStorageService.storeAudioFile(newAudioFile);
        String audioUrl = "/api/pronunciation/audio/" + filename;

        recording.setAudioUrl(audioUrl);
        recording.setAudioStoragePath(filename);
        recording.setStatus(RecordingStatus.PROCESSING);
        recording.setSubmittedAt(LocalDateTime.now());
        recording.setEvaluatedAt(null);
        recording.setOverallScore(null);
        recording.setPronunciationScore(null);
        recording.setFluencyScore(null);
        recording.setIntonationScore(null);
        recording.setClarityScore(null);
        recording.setAiFeedback(null);
        recording.setProblematicPhonemes(null);

        return recordingRepository.save(recording);
    }

    public List<UserRecording> getRecordingsByChallenge(Long challengeId) {
        return recordingRepository.findByChallengeId(challengeId);
    }

    public void analyzeRecording(Long recordingId, String filename, String expectedText) {
        UserRecording recording = recordingRepository.findById(recordingId)
                .orElseThrow(() -> new RuntimeException("Recording not found"));

        log.info("Starting AI analysis for recording ID: {}", recordingId);

        try {
            Path filePath = Paths.get(UPLOAD_DIR, filename);
            if (!Files.exists(filePath)) {
                throw new IOException("Audio file not found: " + filename);
            }

            byte[] audioBytes = Files.readAllBytes(filePath);

            String contentType = getContentTypeFromExtension(filename);
            MultipartFile tempFile = createMultipartFile(filename, contentType, audioBytes);

            AudioAnalysisResult result = aiService.analyzePronunciation(tempFile, expectedText);

            recording.setOverallScore(result.pronunciationScore());
            recording.setPronunciationScore(result.pronunciationScore());
            recording.setFluencyScore(result.fluencyScore());
            recording.setIntonationScore(result.intonationScore());
            recording.setClarityScore(result.clarityScore());
            recording.setAiFeedback(result.overallFeedback());
            recording.setProblematicPhonemes(result.problematicPhonemes());

            if (result.improvementTips() != null && !result.improvementTips().isEmpty()) {
                recording.setImprovementTips(String.join("; ", result.improvementTips()));
            }

            recording.setStatus(RecordingStatus.COMPLETED);
            recording.setEvaluatedAt(LocalDateTime.now());

            recordingRepository.save(recording);

            log.info("AI Analysis completed for recording {}. Score: {}", recordingId, result.pronunciationScore());

        } catch (Exception e) {
            log.error("AI Analysis failed for recording {}", recordingId, e);
            recording.setStatus(RecordingStatus.COMPLETED);
            recording.setAiFeedback("Analysis service temporarily unavailable.");
            recording.setOverallScore(65.0);
            recordingRepository.save(recording);
        }

        updateUserStats(recording.getUserId(), recording);
    }

    private MultipartFile createMultipartFile(String filename, String contentType, byte[] content) {
        return new MultipartFile() {
            @Override public String getName() { return "audio"; }
            @Override public String getOriginalFilename() { return filename; }
            @Override public String getContentType() { return contentType; }
            @Override public boolean isEmpty() { return content.length == 0; }
            @Override public long getSize() { return content.length; }
            @Override public byte[] getBytes() { return content; }
            @Override public InputStream getInputStream() { return new ByteArrayInputStream(content); }
            @Override public void transferTo(File dest) throws IOException, IllegalStateException { Files.write(dest.toPath(), content); }
        };
    }

    private String getContentTypeFromExtension(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".webm")) return "audio/webm";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".m4a")) return "audio/mp4";
        return "audio/webm";
    }

    private void analyzeRecordingAsync(Long recordingId, String filename, String expectedText) {
        new Thread(() -> analyzeRecording(recordingId, filename, expectedText)).start();
    }

    public Optional<UserRecording> getRecordingById(Long id) {
        return recordingRepository.findById(id);
    }

    public Page<UserRecording> getUserRecordings(Long userId, Pageable pageable, CollectionType collection) {
        if (collection == null) {
            return recordingRepository.findByUserId(userId, pageable);
        }
        
        double minScore;
        double maxScore = Double.MAX_VALUE;
        switch (collection) {
            case PERFECT -> minScore = 90.0;
            case EXCELLENT -> {
                minScore = 80.0;
                maxScore = 89.99;
            }
            case GOOD -> {
                minScore = 70.0;
                maxScore = 79.99;
            }
            case PRACTICE -> {
                minScore = 0.0;
                maxScore = 69.99;
            }
            case STREAK_MASTER -> {
                minScore = 99.0;
                maxScore = 99.99;
            }
            default -> { return recordingRepository.findByUserId(userId, pageable); }
        }
        
        return recordingRepository.findByUserIdAndScoreRange(userId, minScore, maxScore, pageable);
    }

    public void assignToCollection(Long recordingId, CollectionType collection) {
        UserRecording recording = recordingRepository.findById(recordingId)
            .orElseThrow(() -> new RuntimeException("Recording not found"));
        
        RecordingCollection coll = recordingCollectionRepository.findByUserIdAndType(recording.getUserId(), collection);
        if (coll == null) {
            coll = RecordingCollection.builder()
                .userId(recording.getUserId())
                .type(collection)
                .count(1)
                .build();
        } else {
            coll.setCount(coll.getCount() + 1);
        }
        
        recordingCollectionRepository.save(coll);
    }

    public Page<UserRecording> getChallengeRecordings(Long challengeId, Pageable pageable) {
        return recordingRepository.findByChallengeId(challengeId, pageable);
    }

    public List<UserRecording> getOneChallengeRecordings(Long challengeId) {
        return recordingRepository.findByChallengeId(challengeId);
    }

    public List<UserRecording> getAll() {
        return recordingRepository.findAll();
    }

    public void deleteRecording(Long id) {
        recordingRepository.deleteById(id);
    }

    private void updateUserStats(Long userId, UserRecording recording) {
        progressService.updateUserProgress(userId, recording);
        log.info("Updated stats + badges for user {} - score: {}", userId, recording.getOverallScore());
    }
}

