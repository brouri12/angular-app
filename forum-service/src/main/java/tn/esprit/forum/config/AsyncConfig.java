package tn.esprit.forum.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration class to enable asynchronous method execution.
 * This allows @Async annotated methods to run in separate threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Spring Boot will automatically configure the async executor
    // using properties from application.properties:
    // - spring.task.execution.pool.core-size
    // - spring.task.execution.pool.max-size
    // - spring.task.execution.pool.queue-capacity
}
