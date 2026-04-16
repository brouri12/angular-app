package org.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for Gamified English Learning Platform application.
 */
@SpringBootApplication
@EnableCaching
@EnableScheduling
public class GamifiedLearningApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamifiedLearningApplication.class, args);
    }
}

