package tn.esprit.user;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import tn.esprit.user.entity.User;
import tn.esprit.user.entity.User.UserRole;
import tn.esprit.user.repository.UserRepository;

import java.time.LocalDate;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
@RequiredArgsConstructor
public class UserServiceApplication {
    
    private final UserRepository userRepository;
    
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
        System.out.println("===========================================");
        System.out.println("User Service démarré avec succès!");
        System.out.println("Port: 8085");
        System.out.println("Swagger: http://localhost:8085/swagger-ui.html");
        System.out.println("Keycloak: http://localhost:9090");
        System.out.println("===========================================");
    }
    
    @Bean
    ApplicationRunner init() {
        return args -> {
            // Les utilisateurs sont gérés par Keycloak
            // Ce service synchronise uniquement les données
            System.out.println("✓ User Service prêt à synchroniser avec Keycloak");
            System.out.println("  Créez des utilisateurs via Keycloak ou l'API /api/auth/register");
        };
    }
}
