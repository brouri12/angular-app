package tn.esprit.clubservice.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS is handled by the API Gateway (CorsWebFilter).
 * This class is intentionally left empty to avoid duplicate
 * Access-Control-Allow-Origin headers.
 */
@Configuration
public class CorsConfig {
    // No CORS beans here — managed centrally by ApiGateway
}
