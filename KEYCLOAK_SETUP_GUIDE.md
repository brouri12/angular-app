# Guide d'Installation et Configuration de Keycloak

## Installation de Keycloak

### Option 1: Docker (Recommandé)

```bash
docker run -d \
  --name keycloak \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:23.0.0 \
  start-dev
```

### Option 2: Téléchargement Direct

1. Télécharger Keycloak: https://www.keycloak.org/downloads
2. Extraire l'archive
3. Lancer Keycloak:
   ```bash
   cd keycloak-23.0.0
   bin/kc.bat start-dev  # Windows
   bin/kc.sh start-dev   # Linux/Mac
   ```

## Configuration de Keycloak

### 1. Accéder à la Console Admin

- URL: http://localhost:8080
- Username: `admin`
- Password: `admin`

### 2. Créer un Realm

1. Cliquer sur le menu déroulant "master" en haut à gauche
2. Cliquer sur "Create Realm"
3. Nom du realm: `wordly-realm`
4. Cliquer sur "Create"

### 3. Créer les Rôles

1. Dans le menu de gauche, cliquer sur "Realm roles"
2. Cliquer sur "Create role"
3. Créer les 3 rôles suivants:
   - **ADMIN**
   - **TEACHER**
   - **STUDENT**

### 4. Créer un Client

1. Dans le menu de gauche, cliquer sur "Clients"
2. Cliquer sur "Create client"
3. Configuration:
   - **Client ID**: `wordly-client`
   - **Client Protocol**: `openid-connect`
   - Cliquer sur "Next"
4. Capability config:
   - **Client authentication**: ON
   - **Authorization**: OFF
   - **Authentication flow**: 
     - ✅ Standard flow
     - ✅ Direct access grants
   - Cliquer sur "Next"
5. Login settings:
   - **Valid redirect URIs**: 
     - `http://localhost:4200/*`
     - `http://localhost:4201/*`
     - `http://localhost:8085/*`
   - **Valid post logout redirect URIs**: `+`
   - **Web origins**: `*`
   - Cliquer sur "Save"

### 5. Récupérer le Client Secret

1. Aller dans "Clients" → "wordly-client"
2. Onglet "Credentials"
3. Copier le "Client secret"
4. Mettre à jour dans `application.properties`:
   ```properties
   keycloak.credentials.secret=VOTRE_CLIENT_SECRET
   ```

### 6. Configurer les Attributs Personnalisés

1. Dans le menu de gauche, cliquer sur "Client scopes"
2. Cliquer sur "wordly-client-dedicated"
3. Onglet "Mappers"
4. Cliquer sur "Add mapper" → "By configuration" → "User Attribute"

Créer les mappers suivants:

#### Mapper: nom
- **Name**: nom
- **User Attribute**: nom
- **Token Claim Name**: nom
- **Claim JSON Type**: String
- **Add to ID token**: ON
- **Add to access token**: ON
- **Add to userinfo**: ON

#### Mapper: prenom
- **Name**: prenom
- **User Attribute**: prenom
- **Token Claim Name**: prenom
- **Claim JSON Type**: String
- **Add to ID token**: ON
- **Add to access token**: ON
- **Add to userinfo**: ON

#### Mapper: telephone
- **Name**: telephone
- **User Attribute**: telephone
- **Token Claim Name**: telephone
- **Claim JSON Type**: String
- **Add to ID token**: ON
- **Add to access token**: ON
- **Add to userinfo**: ON

#### Mapper: role
- **Name**: role
- **User Attribute**: role
- **Token Claim Name**: role
- **Claim JSON Type**: String
- **Add to ID token**: ON
- **Add to access token**: ON
- **Add to userinfo**: ON

Répéter pour tous les attributs:
- specialite
- experience
- disponibilite
- date_naissance
- niveau_actuel
- statut_etudiant
- poste

### 7. Créer des Utilisateurs de Test (Optionnel)

1. Dans le menu de gauche, cliquer sur "Users"
2. Cliquer sur "Add user"
3. Configuration pour Admin:
   - **Username**: admin
   - **Email**: admin@wordly.com
   - **First name**: Admin
   - **Last name**: System
   - **Email verified**: ON
   - Cliquer sur "Create"
4. Onglet "Credentials":
   - Cliquer sur "Set password"
   - **Password**: admin123
   - **Temporary**: OFF
   - Cliquer sur "Save"
5. Onglet "Role mapping":
   - Cliquer sur "Assign role"
   - Sélectionner "ADMIN"
   - Cliquer sur "Assign"
6. Onglet "Attributes":
   - Ajouter les attributs personnalisés

Répéter pour teacher1 et student1.

## Configuration du Microservice

### application.properties

```properties
# Configuration Keycloak
keycloak.realm=wordly-realm
keycloak.auth-server-url=http://localhost:8080
keycloak.resource=wordly-client
keycloak.credentials.secret=VOTRE_CLIENT_SECRET
keycloak.use-resource-role-mappings=true
keycloak.bearer-only=true

# Configuration OAuth2 Resource Server
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/wordly-realm
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8080/realms/wordly-realm/protocol/openid-connect/certs

# Keycloak Admin Client
keycloak.admin.server-url=http://localhost:8080
keycloak.admin.realm=master
keycloak.admin.client-id=admin-cli
keycloak.admin.username=admin
keycloak.admin.password=admin
```

## Test de l'Intégration

### 1. Obtenir un Token

```bash
POST http://localhost:8080/realms/wordly-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=wordly-client
&client_secret=VOTRE_CLIENT_SECRET
&username=admin
&password=admin123
```

**Réponse:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "token_type": "Bearer"
}
```

### 2. Utiliser le Token

```bash
GET http://localhost:8085/api/users
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI...
```

## Architecture Complète

```
┌─────────────────────────────────────────────────────────────┐
│                    KEYCLOAK (Port 8080)                      │
│  - Authentification                                          │
│  - Gestion des utilisateurs                                  │
│  - Génération de tokens JWT                                  │
│  - Attributs personnalisés                                   │
└────────────────────┬────────────────────────────────────────┘
                     │ OAuth2/JWT
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              USER SERVICE (Port 8085)                        │
│  - Validation des tokens JWT                                 │
│  - Synchronisation avec Keycloak                            │
│  - Stockage des données utilisateur (MySQL)                 │
│  - API REST pour la gestion des utilisateurs                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND/BACK-OFFICE                        │
│  - Login via Keycloak                                        │
│  - Utilisation du token JWT                                  │
│  - Appels API protégés                                       │
└─────────────────────────────────────────────────────────────┘
```

## URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| Keycloak Admin | http://localhost:8080 | Console d'administration |
| Keycloak Realm | http://localhost:8080/realms/wordly-realm | Realm wordly |
| Token Endpoint | http://localhost:8080/realms/wordly-realm/protocol/openid-connect/token | Obtenir un token |
| User Service | http://localhost:8085 | Microservice utilisateur |
| Swagger | http://localhost:8085/swagger-ui.html | Documentation API |

## Troubleshooting

### Keycloak ne démarre pas
- Vérifier que le port 8080 est libre
- Vérifier les logs Docker: `docker logs keycloak`

### Erreur 401 Unauthorized
- Vérifier que le token est valide
- Vérifier la configuration du client dans Keycloak
- Vérifier l'issuer-uri dans application.properties

### Erreur lors de la création d'utilisateur
- Vérifier les credentials admin dans application.properties
- Vérifier que les rôles existent dans Keycloak
- Vérifier les logs du service

### Token expiré
- Les tokens expirent après 5 minutes par défaut
- Utiliser le refresh_token pour obtenir un nouveau token
- Ou se reconnecter

## Prochaines Étapes

1. ✅ Keycloak installé et configuré
2. ✅ Realm et client créés
3. ✅ Rôles configurés
4. ✅ Attributs personnalisés mappés
5. 🔄 Intégration avec le frontend Angular
6. 🔄 Intégration avec le back-office
7. 🔄 Gestion des refresh tokens
8. 🔄 Social login (Google, Facebook)
