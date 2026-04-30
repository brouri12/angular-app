package com.gestions.ramzi.servicepronunciation.services;

import com.gestions.ramzi.servicepronunciation.dto.AudioAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final RestTemplate restTemplate;

    private static final String FASTAPI_URL = "http://localhost:8000/analyze-pronunciation";

    public AudioAnalysisResult analyzePronunciation(MultipartFile audioFile, String expectedText) {
        log.info("Sending audio to FastAPI for analysis. Expected text: '{}'", expectedText);

        try {
            final String filename = audioFile.getOriginalFilename() != null
                    ? audioFile.getOriginalFilename()
                    : "recording.webm";

            final byte[] audioBytes = audioFile.getBytes();

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("audio", new ByteArrayResource(audioBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            });
            body.add("expected_text", expectedText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<AudioAnalysisResult> response = restTemplate.postForEntity(
                    FASTAPI_URL,
                    requestEntity,
                    AudioAnalysisResult.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                AudioAnalysisResult result = response.getBody();
                log.info("FastAPI returned score: {}", result.pronunciationScore());
                return result;
            } else {
                log.warn("FastAPI returned non-success status: {}", response.getStatusCode());
                return getFallbackResult(expectedText);
            }

        } catch (IOException e) {
            log.error("Failed to read audio bytes from multipart file", e);
            return getFallbackResult(expectedText);
        } catch (Exception e) {
            log.error("Error communicating with FastAPI: {}", e.getMessage(), e);
            return getFallbackResult(expectedText);
        }
    }

    private AudioAnalysisResult getFallbackResult(String expectedText) {
        log.warn("Using fallback analysis result for: '{}'", expectedText);
        return new AudioAnalysisResult(
                "[Analysis unavailable]",
                0.0,
                0.0,
                0.0,
                0.0,
                "Could not analyze pronunciation. Please try again.",
                List.of(),
                List.of(
                        "Ensure your microphone is working",
                        "Try speaking more clearly",
                        "Check your internet connection"
                ),
                Map.of("wordAccuracy", 0.0, "speed", 0.0),
                0.0
        );
    }
}