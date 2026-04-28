package com.gestions.ramzi.servicepronunciation.dto;

import com.gestions.ramzi.servicepronunciation.entities.UserRecording;

public class UserRecordingDTO {
    private Long id;
    private Long challengeId;
    private String audioUrl;
    // other fields you actually need...

    public UserRecordingDTO(UserRecording r) {
        this.id = r.getId();
        this.challengeId = r.getChallenge().getId(); // safe, just the ID
        this.audioUrl = r.getAudioUrl();
    }
}
