package tn.esprit.recrutement.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI recrutementServiceAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8083");
        localServer.setDescription("Recrutement Service - Environnement Local");

        Server gatewayServer = new Server();
        gatewayServer.setUrl("http://localhost:8080");
        gatewayServer.setDescription("Recrutement Service via API Gateway");

        Contact contact = new Contact();
        contact.setEmail("recrutement@esprit.tn");
        contact.setName("Équipe Recrutement ESPRIT");
        contact.setUrl("https://esprit.tn");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Recrutement Service API")
                .version("1.0.0")
                .contact(contact)
                .description("API REST pour la gestion du recrutement des enseignants ESPRIT. " +
                        "Cette API permet de gérer les offres de recrutement, les candidatures, " +
                        "et offre un workflow complet de validation.")
                .termsOfService("https://esprit.tn/terms")
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, gatewayServer));
    }
}
