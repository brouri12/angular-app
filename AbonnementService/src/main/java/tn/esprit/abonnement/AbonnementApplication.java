package tn.esprit.abonnement;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.Bean;
import tn.esprit.abonnement.entity.Abonnement;
import tn.esprit.abonnement.entity.HistoriqueAbonnement;
import tn.esprit.abonnement.repository.AbonnementRepository;
import tn.esprit.abonnement.repository.HistoriqueAbonnementRepository;

@SpringBootApplication
@EnableDiscoveryClient
public class AbonnementApplication {

    public static void main(String[] args) {
        SpringApplication.run(AbonnementApplication.class, args);
        System.out.println("==============================================");
        System.out.println("✅ Microservice Abonnement démarré avec succès!");
        System.out.println("📍 Port: 8084");
        System.out.println("🌐 URL: http://localhost:8084/api/abonnements");
        System.out.println("🔍 Eureka: http://localhost:8761");
        System.out.println("==============================================");
    }

    @Bean
    ApplicationRunner init(AbonnementRepository abonnementRepository, 
                          HistoriqueAbonnementRepository historiqueRepository) {
        return args -> {
            System.out.println("🔄 Initialisation des données par défaut...");
            
            // Insertion de 3 abonnements par défaut
            Abonnement basic = new Abonnement(
                "Basic",
                "Abonnement de base pour débutants",
                9.99,
                30,
                "Basique",
                false,
                false,
                "Actif"
            );
            
            Abonnement premium = new Abonnement(
                "Premium",
                "Abonnement premium avec fonctionnalités avancées",
                29.99,
                30,
                "Premium",
                true,
                true,
                "Actif"
            );
            
            Abonnement enterprise = new Abonnement(
                "Enterprise",
                "Solution complète pour les entreprises",
                99.99,
                365,
                "Enterprise",
                true,
                true,
                "Actif"
            );
            
            abonnementRepository.save(basic);
            abonnementRepository.save(premium);
            abonnementRepository.save(enterprise);
            
            System.out.println("✅ 3 abonnements créés avec succès!");
            
            // Insertion de 2 paiements par défaut
            HistoriqueAbonnement paiement1 = new HistoriqueAbonnement(
                "Jean Dupont",
                "jean.dupont@email.com",
                "Premium",
                29.99,
                "Carte bancaire",
                "TXN-2024-001",
                "Validé"
            );
            
            HistoriqueAbonnement paiement2 = new HistoriqueAbonnement(
                "Marie Martin",
                "marie.martin@email.com",
                "Basic",
                9.99,
                "PayPal",
                "TXN-2024-002",
                "Validé"
            );
            
            historiqueRepository.save(paiement1);
            historiqueRepository.save(paiement2);
            
            System.out.println("✅ 2 paiements créés avec succès!");
            System.out.println("==============================================");
            System.out.println("📊 Base de données initialisée!");
            System.out.println("==============================================");
        };
    }
}
