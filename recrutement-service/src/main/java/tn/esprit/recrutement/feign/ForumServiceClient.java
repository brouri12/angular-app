package tn.esprit.recrutement.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * OpenFeign client pour communiquer avec le forum-service.
 * Permet de vérifier si un candidat est actif dans les forums
 * avant de traiter sa candidature.
 */
@FeignClient(name = "forum-service", fallback = ForumServiceClientFallback.class)
public interface ForumServiceClient {

    /**
     * Vérifie si un utilisateur a posté dans les forums (par email).
     * Utilisé pour enrichir le profil d'un candidat.
     */
    @GetMapping("/api/forum/messages/count-by-email")
    int countMessagesByEmail(@RequestParam("email") String email);

    /**
     * Vérifie si le forum-service est disponible.
     */
    @GetMapping("/actuator/health")
    String health();
}
