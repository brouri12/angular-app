# API Gateway

Passerelle API pour router les requêtes vers les microservices.

## Configuration

- **Port**: 8888
- **Eureka**: http://localhost:8761/eureka/

## Routes disponibles

### Service Abonnement
```
http://localhost:8888/abonnement-service/api/abonnements
```

Au lieu de:
```
http://localhost:8084/api/abonnements
```

## Démarrage

1. S'assurer qu'Eureka Server est démarré (port 8761)
2. Ouvrir le projet dans IntelliJ IDEA
3. Exécuter `ApiGatewayApplication.java`

## Avantages

- Point d'entrée unique pour tous les microservices
- Load balancing automatique
- CORS configuré
- Découverte de services via Eureka
