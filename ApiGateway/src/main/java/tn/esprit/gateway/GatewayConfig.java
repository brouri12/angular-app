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
                .build();
    }
}
