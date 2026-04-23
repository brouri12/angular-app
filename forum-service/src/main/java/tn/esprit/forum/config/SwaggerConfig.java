package tn.esprit.forum.config;

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
    public OpenAPI forumServiceAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8082");
        localServer.setDescription("Forum Service - Environnement Local");

        Server gatewayServer = new Server();
        gatewayServer.setUrl("http://localhost:8080");
        gatewayServer.setDescription("Forum Service via API Gateway");

        Contact contact = new Contact();
        contact.setEmail("forum@esprit.tn");
        contact.setName("Équipe Forum JUNGLE IN ENGLISH");
        contact.setUrl("https://esprit.tn");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Forum Service API")
                .version("1.0.0")
                .contact(contact)
                .description("API REST pour la gestion du forum académique JUNGLE IN ENGLISH. " +
                        "Cette API permet de gérer les forums de discussion, les messages, " +
                        "et offre des fonctionnalités de recherche et de statistiques.")
                .termsOfService("https://esprit.tn/terms")
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, gatewayServer));
    }
}
