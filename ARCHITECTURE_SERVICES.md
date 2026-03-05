# Architecture des Services - Configuration Actuelle

## 🎯 Objectif

Les services sont **complètement indépendants** pour permettre:
- Test du User Service via Swagger uniquement
- Abonnement Service fonctionne sans authentification pour les frontends

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API GATEWAY (8888)                       │
│                    Gestion CORS centralisée                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│  ABONNEMENT SERVICE       │   │    USER SERVICE           │
│  Port: 8084               │   │    Port: 8085             │
│  ✅ SANS AUTHENTIFICATION │   │    🔒 AVEC KEYCLOAK       │
│                           │   │                           │
│  Accessible par:          │   │  Accessible par:          │
│  - Frontend (4200)        │   │  - Swagger uniquement     │
│  - Back-Office (4201)     │   │  - Tests manuels          │
│  - Swagger                │   │                           │
│                           │   │  Endpoints publics:       │
│  Base de données:         │   │  - /api/auth/register     │
│  MySQL abonnement_db      │   │  - /api/auth/test-*       │
│  Port: 3307               │   │  - /swagger-ui/**         │
│                           │   │                           │
│                           │   │  Endpoints protégés:      │
│                           │   │  - /api/users/** (JWT)    │
│                           │   │                           │
│                           │   │  Base de données:         │
│                           │   │  MySQL user_db            │
│                           │   │  Port: 3307               │
│                           │   │                           │
│                           │   │  Authentification:        │
│                           │   │  Keycloak (9090)          │
└───────────────────────────┘   └───────────────────────────┘
```

## 🔓 Abonnement Service - SANS AUTHENTIFICATION

### Configuration
- **Pas de sécurité Spring Security**
- **Pas de dépendance Keycloak**
- **CORS géré par API Gateway**
- Tous les endpoints sont publics

### Endpoints Disponibles
```
GET    /api/abonnements              - Liste tous les abonnements
GET    /api/abonnements/{id}         - Détails d'un abonnement
POST   /api/abonnements              - Créer un abonnement
PUT    /api/abonnements/{id}         - Modifier un abonnement
DELETE /api/abonnements/{id}         - Supprimer un abonnement
PATCH  /api/abonnements/{id}/statut  - Changer le statut

GET    /api/abonnements/paiements    - Liste tous les paiements
POST   /api/abonnements/paiements    - Créer un paiement
...
```

### Accès
- ✅ Frontend Angular (localhost:4200)
- ✅ Back-Office Angular (localhost:4201)
- ✅ Swagger (localhost:8084/swagger-ui.html)
- ✅ Directement via API Gateway (localhost:8888/abonnement-service/api/abonnements)

### Pas de Token Requis
```bash
# Fonctionne directement
curl http://localhost:8888/abonnement-service/api/abonnements
```

## 🔒 User Service - AVEC AUTHENTIFICATION KEYCLOAK

### Configuration
- **Spring Security avec OAuth2 Resource Server**
- **Keycloak pour l'authentification**
- **JWT tokens requis pour endpoints protégés**

### Endpoints Publics (sans token)
```
POST   /api/auth/register            - Inscription
GET    /api/auth/info                - Informations
GET    /api/auth/test-keycloak       - Test connexion Keycloak
GET    /swagger-ui/**                - Documentation Swagger
```

### Endpoints Protégés (token JWT requis)
```
GET    /api/auth/me                  - Utilisateur connecté
GET    /api/users                    - Liste des utilisateurs
GET    /api/users/{id}               - Détails utilisateur
PUT    /api/users/{id}               - Modifier utilisateur
DELETE /api/users/{id}               - Supprimer utilisateur
...
```

### Accès

#### 1. Endpoints Publics (Swagger)
```
http://localhost:8085/swagger-ui.html
```
Utiliser directement les endpoints `/api/auth/register` et `/api/auth/test-keycloak`

#### 2. Endpoints Protégés (avec token)

**Étape 1: Créer un utilisateur**
```json
POST http://localhost:8085/api/auth/register
{
  "username": "admin_test",
  "email": "admin@test.com",
  "password": "Admin123!",
  "role": "ADMIN",
  "nom": "Test",
  "prenom": "Admin",
  "telephone": "+216 12345678",
  "poste": "Directeur"
}
```

**Étape 2: Obtenir un token**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token" `
  -Method Post -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    username = "admin_test"
    password = "Admin123!"
    grant_type = "password"
    client_id = "wordly-client"
    client_secret = "fFWjOZlxqLgrswbI9sfeiDj1xQbyw1DG"
  }
$token = $response.access_token
```

**Étape 3: Utiliser le token**
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" `
  -Headers @{"Authorization" = "Bearer $token"}
```

## 🚫 Pas de Relation Entre les Services

### Abonnement Service
- **NE communique PAS** avec User Service
- **NE vérifie PAS** l'authentification
- Fonctionne de manière autonome
- Les frontends peuvent l'utiliser librement

### User Service
- **NE communique PAS** avec Abonnement Service
- Utilisé uniquement pour les tests Swagger
- Authentification isolée avec Keycloak
- Pas intégré avec les frontends pour l'instant

## 📝 Cas d'Usage Actuels

### Frontend Angular (Port 4200)
```typescript
// Fonctionne sans authentification
this.abonnementService.getAbonnements().subscribe(data => {
  // Récupère les abonnements
});

this.abonnementService.createAbonnement(abonnement).subscribe(data => {
  // Crée un abonnement
});
```

### Back-Office Angular (Port 4201)
```typescript
// Fonctionne sans authentification
this.abonnementService.getAbonnements().subscribe(data => {
  // Gestion des abonnements
});

this.abonnementService.updateAbonnement(id, abonnement).subscribe(data => {
  // Modification
});
```

### User Service (Swagger uniquement)
```
1. Ouvrir http://localhost:8085/swagger-ui.html
2. Tester POST /api/auth/register
3. Créer des utilisateurs ADMIN, TEACHER, STUDENT
4. Vérifier dans MySQL user_db
5. Vérifier dans Keycloak
```

## 🔄 CORS Configuration

### API Gateway (CorsConfig.java)
```java
// Gère CORS pour tous les services
allowedOrigins: http://localhost:4200, http://localhost:4201
allowedMethods: GET, POST, PUT, DELETE, PATCH, OPTIONS
allowedHeaders: *
```

### Abonnement Service
- ✅ `@CrossOrigin` SUPPRIMÉ du controller
- CORS géré uniquement par API Gateway

### User Service
- CORS géré par Spring Security
- Configuré dans SecurityConfig.java

## ✅ Avantages de Cette Architecture

1. **Indépendance**: Chaque service fonctionne seul
2. **Flexibilité**: Abonnement Service accessible sans contraintes
3. **Sécurité**: User Service protégé par Keycloak
4. **Tests**: User Service testable via Swagger
5. **Évolutivité**: Facile d'ajouter l'authentification plus tard

## 🔮 Intégration Future (Optionnelle)

Si vous voulez intégrer l'authentification plus tard:

1. **Ajouter Spring Security à Abonnement Service**
2. **Configurer Keycloak dans Abonnement Service**
3. **Créer des services Angular pour User Service**
4. **Ajouter login/register dans les frontends**
5. **Gérer les tokens JWT dans les services Angular**
6. **Protéger les routes avec guards**

Mais pour l'instant, tout fonctionne de manière indépendante! 🎉

## 📊 Résumé des Ports

| Service | Port | Authentification | Accessible par |
|---------|------|------------------|----------------|
| Frontend | 4200 | Non | Navigateur |
| Back-Office | 4201 | Non | Navigateur |
| MySQL | 3307 | - | Services |
| AbonnementService | 8084 | ❌ Non | Frontend, Back-Office, Swagger |
| UserService | 8085 | ✅ Oui (Keycloak) | Swagger uniquement |
| EurekaServer | 8761 | Non | Services |
| ApiGateway | 8888 | Non | Frontend, Back-Office |
| Keycloak | 9090 | - | UserService |

## 🎯 Pour Tester Maintenant

### Abonnement Service
```bash
# Via API Gateway
curl http://localhost:8888/abonnement-service/api/abonnements

# Directement
curl http://localhost:8084/api/abonnements

# Via Frontend/Back-Office
# Ouvrir http://localhost:4200 ou http://localhost:4201
# Tout fonctionne normalement
```

### User Service
```bash
# Ouvrir Swagger
http://localhost:8085/swagger-ui.html

# Tester l'inscription
POST /api/auth/register avec les exemples de QUICK_TEST_COMMANDS.md
```
