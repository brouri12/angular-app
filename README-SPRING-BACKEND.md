# Backend E-Learning – Spring Boot (microservices)

Dépôt : [github.com/brouri12/spring-app](https://github.com/brouri12/spring-app)

## Contenu

| Dossier / Fichier | Rôle |
|-------------------|------|
| **eureka-server/** | Service de découverte (port 8761) |
| **api-gateway/** | Gateway Spring (port 8080) |
| **formation-service/** | Microservice formations / cours |
| **quiz-badge-service/** | Microservice quiz et badges |
| **simple-formation-service/** | Variante simplifiée formation |
| **test-service/** | Service de test |
| **docker-compose.yml** | Lancement des services avec Docker |
| **Dockerfile.\*** | Images Docker pour chaque service |

## Démarrage rapide

1. Démarrer Eureka : `cd eureka-server && ./mvnw spring-boot:run`
2. Démarrer formation-service et quiz-badge-service
3. Démarrer api-gateway

Voir [MICROSERVICES.md](MICROSERVICES.md) dans le projet principal pour l’ordre complet et la configuration.
