# Guide de Démarrage des Microservices

## Architecture

```
┌─────────────────┐
│  Eureka Server  │  Port 8761
│   (Discovery)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──────┐  │
│ Gateway  │  │  Port 8888
│   API    │  │
└───┬──────┘  │
    │         │
    │    ┌────▼────────────┐
    └────► Abonnement     │  Port 8084
         │   Service      │
         └────────────────┘
```

## Ordre de Démarrage

### 1. Démarrer MySQL
```bash
# Vérifier que MySQL tourne sur le port 3307
# Base de données: abonnement_db (créée automatiquement)
```

### 2. Démarrer Eureka Server (Port 8761)
```bash
cd EurekaServer
# Dans IntelliJ: Exécuter EurekaServerApplication.java
```
**Dashboard**: http://localhost:8761

### 3. Démarrer Abonnement Service (Port 8084)
```bash
cd AbonnementService
# Dans IntelliJ: Exécuter AbonnementApplication.java
```
**Swagger**: http://localhost:8084/swagger-ui.html

### 4. Démarrer API Gateway (Port 8888)
```bash
cd ApiGateway
# Dans IntelliJ: Exécuter ApiGatewayApplication.java
```

## URLs de Test

### Accès Direct (sans Gateway)
```
http://localhost:8084/api/abonnements
http://localhost:8084/swagger-ui.html
```

### Accès via Gateway (recommandé)
```
http://localhost:8888/abonnement-service/api/abonnements
```

### Eureka Dashboard
```
http://localhost:8761
```

## Vérification

1. **Eureka Dashboard** (http://localhost:8761)
   - Vérifier que `ABONNEMENT-SERVICE` et `API-GATEWAY` sont enregistrés

2. **Test Swagger**
   - Ouvrir: http://localhost:8084/swagger-ui.html
   - Tester les endpoints directement

3. **Test via Gateway**
   ```bash
   curl http://localhost:8888/abonnement-service/api/abonnements/hello
   ```

## Ports Utilisés

| Service              | Port |
|---------------------|------|
| Eureka Server       | 8761 |
| API Gateway         | 8888 |
| Abonnement Service  | 8084 |
| MySQL               | 3307 |

## Troubleshooting

### Service non enregistré dans Eureka
- Vérifier que Eureka Server est démarré
- Attendre 30 secondes pour l'enregistrement
- Vérifier les logs du service

### Erreur de connexion MySQL
- Vérifier que MySQL tourne sur le port 3307
- Vérifier username/password dans application.properties

### Gateway ne route pas
- Vérifier que le service est enregistré dans Eureka
- Vérifier l'URL: `/abonnement-service/` (avec le préfixe)
