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

                // ✅ ABONNEMENT SERVICE (si tu veux garder /abonnement-service/**)
                .route("abonnement-service", r -> r
                        .path("/abonnement-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://ABONNEMENT-SERVICE"))

                // ✅ USER SERVICE (si tu veux garder /user-service/**)
                .route("user-service", r -> r
                        .path("/user-service/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://USER-SERVICE"))

                // ✅ EVENT SERVICE (NE PAS stripPrefix)
                .route("event-service", r -> r
                        .path("/events/**")
                        .uri("lb://EVENT-SERVICE"))

                // ✅ REGISTRATION SERVICE (NE PAS stripPrefix)
                .route("registration-service", r -> r
                        .path("/registrations/**")
                        .uri("lb://REGISTRATION-SERVICE"))

                // ✅ CLUB SERVICE (NE PAS stripPrefix)
                .route("club-service", r -> r
                        .path("/clubs/**")
                        .uri("lb://CLUB-SERVICE"))

                // ✅ MEMBRE SERVICE (NE PAS stripPrefix)
                .route("membre-service", r -> r
                        .path("/membres/**")
                        .uri("lb://MEMBRE-SERVICE"))

                .build();
    }
}