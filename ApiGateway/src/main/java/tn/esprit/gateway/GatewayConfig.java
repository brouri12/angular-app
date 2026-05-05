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

                // ── Game Service ─────────────────────────────────────────────
                // Prefixed route: /game-service/** → strips prefix → GAME-SERVICE
                .route("game-service-prefixed", r -> r
                        .path("/game-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://GAME-SERVICE"))

                // Direct routes: /api/** → GAME-SERVICE (no prefix strip)
                .route("game-service-api", r -> r
                        .path("/api/games/**",
                              "/api/submissions/**",
                              "/api/session/**",
                              "/api/stats/**",
                              "/api/crossword/**",
                              "/api/wordladder/**",
                              "/api/admin/**",
                              "/health/**")
                        .uri("lb://GAME-SERVICE"))

                .build();
    }
}
