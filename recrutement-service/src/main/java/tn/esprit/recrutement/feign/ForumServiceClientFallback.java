package tn.esprit.recrutement.feign;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback : si forum-service est indisponible, retourne des valeurs par défaut.
 * Implémente le pattern Circuit Breaker.
 */
@Component
@Slf4j
public class ForumServiceClientFallback implements ForumServiceClient {

    @Override
    public int countMessagesByEmail(String email) {
        log.warn("Forum-service indisponible. Fallback pour email: {}", email);
        return 0; // Valeur par défaut si le service est down
    }

    @Override
    public String health() {
        return "{\"status\":\"DOWN\"}";
    }
}
