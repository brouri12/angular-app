package tn.esprit.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
        System.out.println("===========================================");
        System.out.println("API Gateway démarré avec succès!");
        System.out.println("Port: 8888");
        System.out.println("Routes disponibles:");
        System.out.println("  - http://localhost:8888/abonnement-service/**");
        System.out.println("===========================================");
    }
}
