# Eureka Server

Serveur de découverte de services pour l'architecture microservices.

## Configuration

- **Port**: 8761
- **Dashboard**: http://localhost:8761

## Démarrage

1. Ouvrir le projet dans IntelliJ IDEA
2. Exécuter `EurekaServerApplication.java`
3. Accéder au dashboard: http://localhost:8761

## Services enregistrés

Tous les microservices configurés avec `@EnableDiscoveryClient` s'enregistreront automatiquement auprès d'Eureka.

Services disponibles:
- abonnement-service (port 8084)
