# Installation de Keycloak sur Windows (Sans Docker)

## Prérequis

- Java 17 ou supérieur installé
- Vérifier: `java -version`

## Étape 1: Télécharger Keycloak

1. Aller sur: https://www.keycloak.org/downloads
2. Télécharger **Keycloak 23.0.0** (Server - ZIP)
3. Ou télécharger directement: https://github.com/keycloak/keycloak/releases/download/23.0.0/keycloak-23.0.0.zip

## Étape 2: Extraire l'archive

1. Extraire le fichier ZIP dans un dossier, par exemple:
   ```
   C:\keycloak-23.0.0
   ```

## Étape 3: Créer un utilisateur admin

Ouvrir PowerShell ou CMD dans le dossier Keycloak:

```powershell
cd C:\keycloak-23.0.0
bin\kc.bat create-admin --username admin --password admin
```

## Étape 4: Démarrer Keycloak en mode développement

```powershell
bin\kc.bat start-dev
```

**Attendre que Keycloak démarre** (environ 30 secondes à 1 minute)

Tu verras ce message:
```
Listening on: http://0.0.0.0:8080
```

## Étape 5: Accéder à Keycloak

Ouvrir le navigateur: **http://localhost:8080**

- Username: `admin`
- Password: `admin`

## Configuration Rapide

### 1. Créer le Realm

1. Cliquer sur le menu déroulant "master" (en haut à gauche)
2. Cliquer sur "Create Realm"
3. **Realm name**: `wordly-realm`
4. Cliquer sur "Create"

### 2. Créer les Rôles

1. Menu gauche → "Realm roles"
2. Cliquer sur "Create role"
3. Créer ces 3 rôles:
   - **Name**: `ADMIN` → Create
   - **Name**: `TEACHER` → Create
   - **Name**: `STUDENT` → Create

### 3. Créer le Client

1. Menu gauche → "Clients"
2. Cliquer sur "Create client"
3. **Client ID**: `wordly-client`
4. **Client Protocol**: `openid-connect`
5. Cliquer sur "Next"
6. **Client authentication**: ON (activer)
7. **Authorization**: OFF
8. **Authentication flow**: 
   - ✅ Standard flow
   - ✅ Direct access grants
9. Cliquer sur "Next"
10. **Valid redirect URIs**: 
    ```
    http://localhost:4200/*
    http://localhost:4201/*
    http://localhost:8085/*
    ```
11. **Valid post logout redirect URIs**: `+`
12. **Web origins**: `*`
13. Cliquer sur "Save"

### 4. Récupérer le Client Secret

1. Aller dans "Clients" → "wordly-client"
2. Onglet "Credentials"
3. **Copier le "Client secret"**
4. Mettre à jour dans `UserService/src/main/resources/application.properties`:
   ```properties
   keycloak.credentials.secret=COLLER_ICI_LE_SECRET
   ```

### 5. Créer un utilisateur de test

1. Menu gauche → "Users"
2. Cliquer sur "Add user"
3. Configuration:
   - **Username**: `admin`
   - **Email**: `admin@wordly.com`
   - **First name**: `Admin`
   - **Last name**: `System`
   - **Email verified**: ON
4. Cliquer sur "Create"
5. Onglet "Credentials":
   - Cliquer sur "Set password"
   - **Password**: `admin123`
   - **Temporary**: OFF (désactiver)
   - Cliquer sur "Save"
6. Onglet "Role mapping":
   - Cliquer sur "Assign role"
   - Sélectionner "ADMIN"
   - Cliquer sur "Assign"

## Test de l'installation

### 1. Obtenir un token

Ouvrir Postman ou utiliser curl:

```bash
POST http://localhost:8080/realms/wordly-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
client_id=wordly-client
client_secret=VOTRE_CLIENT_SECRET
username=admin
password=admin123
```

**Réponse attendue:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "token_type": "Bearer"
}
```

### 2. Tester avec le User Service

1. Démarrer MySQL (port 3307)
2. Démarrer Eureka Server (port 8761)
3. Démarrer User Service (port 8085)
4. Tester:
   ```bash
   GET http://localhost:8085/api/users
   Authorization: Bearer COLLER_LE_TOKEN_ICI
   ```

## Commandes Utiles

### Démarrer Keycloak
```powershell
cd C:\keycloak-23.0.0
bin\kc.bat start-dev
```

### Arrêter Keycloak
Appuyer sur `Ctrl+C` dans la console

### Changer le port (si 8080 est occupé)
```powershell
bin\kc.bat start-dev --http-port=8180
```

Puis mettre à jour dans `application.properties`:
```properties
keycloak.auth-server-url=http://localhost:8180
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/wordly-realm
keycloak.admin.server-url=http://localhost:8180
```

## Troubleshooting

### Erreur: Java not found
- Installer Java 17: https://adoptium.net/
- Vérifier: `java -version`

### Port 8080 déjà utilisé
- Utiliser un autre port: `bin\kc.bat start-dev --http-port=8180`
- Ou arrêter l'application qui utilise le port 8080

### Keycloak ne démarre pas
- Vérifier les logs dans la console
- S'assurer que Java 17+ est installé
- Vérifier que le dossier n'est pas en lecture seule

### Impossible de se connecter
- Vérifier que Keycloak est démarré
- Vérifier l'URL: http://localhost:8080
- Vérifier username/password: admin/admin

## Architecture Finale

```
┌─────────────────────────────────────────────────────────────┐
│              KEYCLOAK (http://localhost:8080)                │
│  Realm: wordly-realm                                         │
│  Client: wordly-client                                       │
│  Roles: ADMIN, TEACHER, STUDENT                             │
└────────────────────┬────────────────────────────────────────┘
                     │ OAuth2/JWT
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         USER SERVICE (http://localhost:8085)                 │
│  - Validation JWT via Keycloak                              │
│  - Synchronisation utilisateurs                             │
│  - Stockage MySQL (user_db)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND/BACK-OFFICE                            │
│  - Login via Keycloak                                        │
│  - Token JWT dans les requêtes                              │
└─────────────────────────────────────────────────────────────┘
```

## Prochaines Étapes

1. ✅ Keycloak installé et démarré
2. ✅ Realm créé
3. ✅ Client configuré
4. ✅ Rôles créés
5. ✅ Utilisateur de test créé
6. 🔄 Démarrer le User Service
7. 🔄 Tester l'authentification
8. 🔄 Intégrer avec Angular

## Liens Utiles

- Documentation Keycloak: https://www.keycloak.org/documentation
- Admin Console: http://localhost:8080
- Realm wordly: http://localhost:8080/realms/wordly-realm
