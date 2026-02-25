# Guide d'Intégration Backend-Frontend

## Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                        │
│  - Port: 4200                                                │
│  - Pricing Page: Affiche les abonnements                    │
│  - Purchase Modal: Formulaire d'achat                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY (Spring Cloud)                  │
│  - Port: 8888                                                │
│  - Route: /abonnement-service/**                            │
└────────────────────┬────────────────────────────────────────┘
                     │ Load Balancing
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              ABONNEMENT SERVICE (Spring Boot)                │
│  - Port: 8084                                                │
│  - REST API: /api/abonnements                               │
│  - Swagger: /swagger-ui.html                                │
└────────────────────┬────────────────────────────────────────┘
                     │ JPA/Hibernate
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL DATABASE                            │
│  - Port: 3307                                                │
│  - Database: abonnement_db                                   │
└─────────────────────────────────────────────────────────────┘
```

## Fichiers Créés

### Backend (Spring Boot)
✅ `AbonnementService/` - Microservice complet
✅ `EurekaServer/` - Service de découverte
✅ `ApiGateway/` - Passerelle API

### Frontend (Angular)
✅ `frontend/angular-app/src/app/models/abonnement.model.ts` - Modèles TypeScript
✅ `frontend/angular-app/src/app/services/abonnement.service.ts` - Service HTTP
✅ `frontend/angular-app/src/app/pages/pricing/` - Page mise à jour avec intégration

## Fonctionnalités Intégrées

### 1. Affichage des Abonnements
- ✅ Récupération depuis l'API: `GET /api/abonnements`
- ✅ Affichage dynamique des cartes
- ✅ Filtrage par statut "Actif"
- ✅ Loading state pendant le chargement

### 2. Achat d'Abonnement
- ✅ Modal de paiement
- ✅ Formulaire avec validation
- ✅ Création de paiement: `POST /api/abonnements/paiements`
- ✅ Génération de référence de transaction
- ✅ Confirmation de succès

### 3. Calcul des Prix
- ✅ Prix mensuel
- ✅ Prix annuel (10 mois)
- ✅ Affichage des économies (17%)

## Démarrage Complet

### 1. Backend (dans l'ordre)

```bash
# 1. Démarrer MySQL (port 3307)

# 2. Démarrer Eureka Server
cd EurekaServer
# Dans IntelliJ: Run EurekaServerApplication.java
# Vérifier: http://localhost:8761

# 3. Démarrer Abonnement Service
cd AbonnementService
# Dans IntelliJ: Run AbonnementApplication.java
# Vérifier: http://localhost:8084/swagger-ui.html

# 4. Démarrer API Gateway
cd ApiGateway
# Dans IntelliJ: Run ApiGatewayApplication.java
# Vérifier: http://localhost:8888/abonnement-service/api/abonnements
```

### 2. Frontend

```bash
cd frontend/angular-app
npm install
npm start
# Ouvrir: http://localhost:4200
```

## Test de l'Intégration

### 1. Vérifier le Backend
```bash
# Test direct
curl http://localhost:8084/api/abonnements

# Test via Gateway
curl http://localhost:8888/abonnement-service/api/abonnements
```

### 2. Tester dans l'Application

1. **Ouvrir l'application**: http://localhost:4200
2. **Aller sur Pricing**: Cliquer sur "Pricing" dans le menu
3. **Voir les abonnements**: Les 3 abonnements doivent s'afficher
4. **Tester l'achat**:
   - Cliquer sur "Subscribe Now"
   - Remplir le formulaire
   - Cliquer sur "Purchase"
   - Vérifier le message de succès

### 3. Vérifier dans la Base de Données

```sql
-- Voir les abonnements
SELECT * FROM abonnements;

-- Voir les paiements
SELECT * FROM historique_abonnements;
```

## URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Application Angular |
| Pricing Page | http://localhost:4200/pricing | Page d'abonnements |
| Eureka | http://localhost:8761 | Dashboard Eureka |
| Swagger | http://localhost:8084/swagger-ui.html | Documentation API |
| API Direct | http://localhost:8084/api/abonnements | Accès direct |
| API Gateway | http://localhost:8888/abonnement-service/api/abonnements | Via Gateway |

## Configuration CORS

Le backend est configuré avec `@CrossOrigin(origins = "*")` pour accepter les requêtes depuis Angular.

## Données de Test

Au démarrage, le backend crée automatiquement:
- 3 abonnements (Basic, Premium, Enterprise)
- 2 paiements de test

## Troubleshooting

### Erreur CORS
- Vérifier que `@CrossOrigin` est présent dans le controller
- Vérifier que le backend est démarré

### Erreur 404
- Vérifier que tous les services sont démarrés
- Vérifier l'URL dans `abonnement.service.ts`
- Utiliser l'URL via Gateway: `http://localhost:8888/abonnement-service/api/abonnements`

### Pas de données
- Vérifier que MySQL est démarré
- Vérifier les logs du backend
- Vérifier que les données sont créées au démarrage

### Gateway ne route pas
- Vérifier qu'Eureka est démarré
- Vérifier que les services sont enregistrés dans Eureka
- Attendre 30 secondes pour l'enregistrement

## Prochaines Étapes

1. ✅ Intégration complète Backend-Frontend
2. 🔄 Ajouter l'authentification JWT
3. 🔄 Créer le dashboard admin dans back-office
4. 🔄 Ajouter plus de microservices (Cours, Utilisateurs)
5. 🔄 Déploiement sur le cloud
