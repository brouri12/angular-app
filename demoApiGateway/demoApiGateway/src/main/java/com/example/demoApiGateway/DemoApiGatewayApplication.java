package com.example.demoApiGateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient



public class DemoApiGatewayApplication {

    public static void main(String[] args) {
		SpringApplication.run(DemoApiGatewayApplication.class, args);
	}
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Route for candidats microservice
                .route("idroute1candidat", r -> r.path("/candidats/**")
                        .uri("http://localhost:8081"))
                // Route for evaluation microservice
                .route("idroute2evaluation", r -> r.path("/evaluation/**")
                        .uri("http://localhost:8087"))
                .build();    }

}
