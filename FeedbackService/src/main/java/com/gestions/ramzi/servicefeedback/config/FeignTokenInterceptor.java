package com.gestions.ramzi.servicefeedback.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Intercepteur Feign pour propager le token JWT lors des appels inter-services.
 * Cela permet à service-feedback d'appeler service-user avec le token d'authentification.
 */
@Component
public class FeignTokenInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        // Récupérer le token JWT du contexte de sécurité
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            // Ajouter le token dans l'en-tête Authorization
            template.header("Authorization", "Bearer " + jwt.getTokenValue());
        }
    }
}

