package com.elearning.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway Application - E-Learning Platform
 * 
 * This application acts as the entry point for all microservices:
 * - /api/formation/** → formation-service (port 8081)
 * - /api/quiz/** → quiz-badge-service (port 8082)
 * - /api/badge/** → quiz-badge-service (port 8082)
 * 
 * Features:
 * - Route management via Spring Cloud Gateway
 * - Service discovery with Eureka Client
 * - CORS configuration for cross-origin requests
 * - Health monitoring via Actuator
 */
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
