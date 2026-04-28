package com.gestions.ramzi.servicepronunciation.config;

import com.gestions.ramzi.servicepronunciation.services.PronunciationChallengeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final PronunciationChallengeService challengeService;

    @Override
    public void run(String... args) {
        log.info("Initializing data for service-pronunciation...");
        
        // Create default challenges if none exist
        challengeService.createDefaultChallenges();
        
        log.info("Data initialization completed for service-pronunciation");
    }
}

