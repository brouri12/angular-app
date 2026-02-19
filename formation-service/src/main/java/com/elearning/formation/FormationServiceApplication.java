package com.elearning.formation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Main application class for Formation Service.
 * Provides course management and enrollment functionality.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class FormationServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(FormationServiceApplication.class, args);
    }
}
