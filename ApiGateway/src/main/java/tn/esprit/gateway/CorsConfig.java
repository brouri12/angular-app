package tn.esprit.gateway;

import org.springframework.context.annotation.Configuration;

/**
 * CORS is configured via application.properties (spring.cloud.gateway.globalcors)
 * to avoid duplicate Access-Control-Allow-Origin headers.
 */
@Configuration
public class CorsConfig {
    // No beans here — CORS managed by gateway globalcors config in application.properties
}
