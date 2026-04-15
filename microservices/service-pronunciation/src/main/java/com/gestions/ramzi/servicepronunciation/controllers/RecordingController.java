package com.gestions.ramzi.servicepronunciation.controllers;

import com.gestions.ramzi.servicepronunciation.dto.RecordingResponse;
import com.gestions.ramzi.servicepronunciation.entities.UserRecording;
import com.gestions.ramzi.servicepronunciation.enums.CollectionType;
import com.gestions.ramzi.servicepronunciation.services.RecordingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/pronunciation/recordings")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Slf4j
public class RecordingController {

    private final RecordingService recordingService;

    /**
     * Soumettre un enregistrement audio
     */
    @PostMapping
    public ResponseEntity<RecordingResponse> submitRecording(
            @RequestParam Long challengeId,
            @RequestParam Long userId,
            @RequestParam MultipartFile audioFile) {
        
        log.info("User {} submitting recording for challenge {}", userId, challengeId);
        
        UserRecording recording = recordingService.submitRecording(challengeId, userId, audioFile);
        RecordingResponse response = mapToResponse(recording);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtenir un enregistrement par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<RecordingResponse> getRecordingById(@PathVariable Long id) {
        return recordingService.getRecordingById(id)
                .map(this::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    /**
     * Obtenir enregistrements d'un utilisateur
     */
@GetMapping("/user/{userId}")
    public ResponseEntity<Page<RecordingResponse>> getUserRecordings(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) CollectionType collection) {
        
        Page<UserRecording> recordings = recordingService.getUserRecordings(userId, PageRequest.of(page, size), collection);
        Page<RecordingResponse> response = recordings.map(this::mapToResponse);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign-collection")
    public ResponseEntity<Void> assignCollection(@PathVariable Long id, @RequestBody CollectionType collection) {
        recordingService.assignToCollection(id, collection);
        return ResponseEntity.ok().build();
    }

    /**
     * Obtenir enregistrements d'un défi
     */
    @GetMapping("/challenge/{challengeId}")
    public ResponseEntity<Page<RecordingResponse>> getChallengeRecordings(
            @PathVariable Long challengeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<UserRecording> recordings = recordingService.getChallengeRecordings(challengeId, PageRequest.of(page, size));
        Page<RecordingResponse> response = recordings.map(this::mapToResponse);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mettre à jour enregistrement (réenregistrement)
     */
    @PutMapping("/{id}")
    public ResponseEntity<RecordingResponse> updateRecording(
            @PathVariable Long id,
            @RequestParam MultipartFile newAudioFile) {
        
        log.info("Updating recording {}", id);
        UserRecording recording = recordingService.updateRecording(id, newAudioFile);
        return ResponseEntity.ok(mapToResponse(recording));
    }

    /**
     * Supprimer enregistrement
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecording(@PathVariable Long id) {
        recordingService.deleteRecording(id);
        return ResponseEntity.noContent().build();
    }

    private RecordingResponse mapToResponse(UserRecording recording) {
        return new RecordingResponse(
            recording.getId(),
            recording.getChallenge().getId(),
            recording.getChallenge().getPhrase(),
            recording.getUserId(),
            recording.getAudioUrl(),
            recording.getOverallScore(),
            recording.getPronunciationScore(),
            recording.getFluencyScore(),
            recording.getIntonationScore(),
            recording.getClarityScore(),
            recording.getAiFeedback(),
            recording.getProblematicPhonemes(),
            recording.getSubmittedAt(),
            recording.getEvaluatedAt(),
            recording.getStatus(),
            recording.getAttemptNumber()
        );
    }
}


