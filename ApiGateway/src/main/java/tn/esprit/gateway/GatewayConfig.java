package tn.esprit.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Route pour le service Abonnement
                .route("abonnement-service", r -> r
                        .path("/abonnement-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://ABONNEMENT-SERVICE"))
                // Route pour le service User - UPPERCASE pour correspondre à Eureka
                .route("user-service", r -> r
                        .path("/user-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://USER-SERVICE"))
                // Route pour le service Challenge
                .route("challenge-service", r -> r
                        .path("/challenge-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://CHALLENGE-SERVICE"))
                // Route pour le service Planification
                .route("planification-service", r -> r
                        .path("/planification-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://PLANIFICATION-SERVICE"))

                // ── Club / Event / Member / Registration services (no stripPrefix) ──
                .route("event-service", r -> r
                        .path("/events/**")
                        .uri("lb://EVENT-SERVICE"))
                .route("registration-service", r -> r
                        .path("/registrations/**")
                        .uri("lb://REGISTRATION-SERVICE"))
                .route("club-service", r -> r
                        .path("/clubs/**")
                        .uri("lb://CLUB-SERVICE"))
                .route("membre-service", r -> r
                        .path("/membres/**")
                        .uri("lb://MEMBRE-SERVICE"))
                // ── Forum / Recrutement services ──────────────────────────────────────
                .route("forum-service", r -> r
                        .path("/api/forum/**")
                        .uri("lb://FORUM-SERVICE"))
                .route("recrutement-service", r -> r
                        .path("/api/recrutement/**")
                        .uri("lb://RECRUTEMENT-SERVICE"))
                .build();
    }
}
