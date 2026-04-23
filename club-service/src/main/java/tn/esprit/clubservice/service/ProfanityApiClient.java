package tn.esprit.clubservice.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ProfanityApiClient {

    private static final String BASE = "https://www.purgomalum.com/service/containsprofanity";

    private final RestTemplate restTemplate;

    // Cache : mot → résultat (évite d'appeler l'API pour le même mot)
    private final ConcurrentHashMap<String, Boolean> cache = new ConcurrentHashMap<>();

    public ProfanityApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean containsProfanity(String text) {
        if (text == null || text.isBlank()) return false;

        String key = text.trim().toLowerCase();

        // Retourner depuis le cache si déjà vérifié
        if (cache.containsKey(key)) {
            System.out.println("🔍 Profanity cache hit [" + key + "] → " + cache.get(key));
            return cache.get(key);
        }

        URI uri = UriComponentsBuilder
                .fromUriString(BASE)
                .queryParam("text", text)
                .encode(StandardCharsets.UTF_8)
                .build()
                .toUri();

        String body = restTemplate.getForObject(uri, String.class);
        boolean result = body != null && "true".equalsIgnoreCase(body.trim());

        // Stocker dans le cache
        cache.put(key, result);
        return result;
    }
}
