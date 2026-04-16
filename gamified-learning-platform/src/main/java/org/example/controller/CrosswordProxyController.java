package org.example.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

/**
 * Proxies requests to APIVerve crossword API.
 * Avoids CORS issues when calling from the browser.
 */
@RestController
@RequestMapping("/api/crossword")
@Slf4j
public class CrosswordProxyController {

    // Set your APIVerve key in application.yml: apiverve.key=YOUR_KEY
    @Value("${apiverve.key:YOUR_API_KEY_HERE}")
    private String apiKey;

    private static final String APIVERVE_URL = "https://api.apiverve.com/v1/crossword";

    @GetMapping("/generate")
    public ResponseEntity<String> generate(
            @RequestParam(defaultValue = "medium") String size,
            @RequestParam(defaultValue = "animals") String theme,
            @RequestParam(defaultValue = "medium") String difficulty) {

        log.info("Generating crossword: size={} theme={} difficulty={}", size, theme, difficulty);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-API-Key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = APIVERVE_URL + "?size=" + size + "&theme=" + theme + "&difficulty=" + difficulty;

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response.getBody());
        } catch (Exception e) {
            log.error("APIVerve error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body("{\"status\":\"error\",\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}
