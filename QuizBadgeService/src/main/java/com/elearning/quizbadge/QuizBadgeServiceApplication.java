package com.elearning.quizbadge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Main application class for Quiz Badge Service.
 * Provides quiz and badge functionality for the e-learning platform.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class QuizBadgeServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(QuizBadgeServiceApplication.class, args);
    }
}
