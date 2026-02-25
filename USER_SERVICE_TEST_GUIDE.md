# Guide de Test - User Service avec Keycloak

## Problèmes Résolus

### 1. Erreur "Password is required"
- **Cause**: Validation @NotBlank sur le champ password dans l'entité User
- **Solution**: Supprimé la validation car le password est géré par Keycloak, pas stocké dans MySQL

### 2. Erreur "Conflict" lors de l'inscription
- **Cause**: Utilisateur avec username "string" ou email déjà existant dans Keycloak
- **Solution**: 
  - Ajout de vérifications avant création dans KeycloakService
  - Script de nettoyage CLEANUP_TEST_USERS.ps1
  - Utiliser des valeurs uniques pour username et email

### 3. Architecture de Stockage
- **Keycloak**: Stocke UNIQUEMENT username, email, password, role
- **MySQL (user_db)**: Stocke TOUS les attributs utilisateur (nom, prenom, telephone, etc.)
- **Synchronisation**: Le keycloak_id lie les deux systèmes

## Étapes de Test

### Étape 1: Nettoyer les Utilisateurs de Test (si nécessaire)

Si vous avez des erreurs de conflit, exécutez:

```powershell
.\CLEANUP_TEST_USERS.ps1
```

Ce script supprime les utilisateurs de test de Keycloak.

### Étape 2: Vérifier que les Services sont Démarrés

1. **Keycloak** (port 9090):
   ```powershell
   cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0\bin
   .\kc.bat start-dev --http-port=9090
   ```
   Accès: http://localhost:9090

2. **MySQL** (port 3307): Doit être démarré

3. **Eureka Server** (port 8761): Lancer EurekaServerApplication.java dans IntelliJ

4. **API Gateway** (port 8888): Lancer ApiGatewayApplication.java dans IntelliJ

5. **User Service** (port 8085): Lancer UserApplication.java dans IntelliJ

### Étape 3: Tester l'Inscription

#### Via Swagger UI

1. Ouvrir: http://localhost:8085/swagger-ui.html

2. Tester la connexion Keycloak:
   - Endpoint: `GET /api/auth/test-keycloak`
   - Cliquer "Try it out" puis "Execute"
   - Vérifier que la réponse est 200 OK

3. Créer un utilisateur ADMIN:
   ```json
   {
     "username": "admin_marwen",
     "email": "admin.marwen@wordly.com",
     "password": "Admin123!",
     "role": "ADMIN",
     "nom": "Marwen",
     "prenom": "Admin",
     "telephone": "+216 12345678",
     "poste": "Directeur"
   }
   ```

4. Créer un utilisateur TEACHER:
   ```json
   {
     "username": "prof_ahmed",
     "email": "ahmed.prof@wordly.com",
     "password": "Prof123!",
     "role": "TEACHER",
     "nom": "Ahmed",
     "prenom": "Ben Ali",
     "telephone": "+216 23456789",
     "specialite": "Anglais",
     "experience": 5,
     "disponibilite": "Lundi-Vendredi 9h-17h"
   }
   ```

5. Créer un utilisateur STUDENT:
   ```json
   {
     "username": "etudiant_sara",
     "email": "sara.etudiant@wordly.com",
     "password": "Student123!",
     "role": "STUDENT",
     "nom": "Sara",
     "prenom": "Trabelsi",
     "telephone": "+216 34567890",
     "date_naissance": "2000-05-15",
     "niveau_actuel": "Intermédiaire",
     "statut_etudiant": "Inscrit"
   }
   ```

#### Via cURL

```powershell
# Créer un admin
curl -X POST "http://localhost:8085/api/auth/register" `
  -H "Content-Type: application/json" `
  -d '{
    "username": "admin_test",
    "email": "admin.test@wordly.com",
    "password": "Admin123!",
    "role": "ADMIN",
    "nom": "Test",
    "prenom": "Admin",
    "telephone": "+216 11111111",
    "poste": "Responsable"
  }'
```

### Étape 4: Vérifier la Création

#### Dans MySQL

```sql
-- Se connecter à MySQL (port 3307)
USE user_db;

-- Voir tous les utilisateurs
SELECT id_user, username, email, role, enabled, nom, prenom, keycloak_id 
FROM users;

-- Voir les détails d'un utilisateur spécifique
SELECT * FROM users WHERE username = 'admin_marwen';
```

#### Dans Keycloak

1. Ouvrir: http://localhost:9090
2. Se connecter: admin / admin
3. Sélectionner le realm "wordly-realm"
4. Aller dans "Users"
5. Vérifier que l'utilisateur est créé avec:
   - Username
   - Email
   - Enabled = true
   - Role dans les attributs

### Étape 5: Tester l'Authentification

#### Obtenir un Token JWT

```powershell
# Remplacer USERNAME et PASSWORD par vos valeurs
$response = Invoke-RestMethod -Uri "http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token" `
  -Method Post `
  -ContentType "application/x-www-form-urlencoded" `
  -Body @{
    username = "admin_marwen"
    password = "Admin123!"
    grant_type = "password"
    client_id = "wordly-client"
    client_secret = "fFWjOZlxqLgrswbI9sfeiDj1xQbyw1DG"
  }

$token = $response.access_token
Write-Host "Token: $token"
```

#### Utiliser le Token pour Accéder aux Endpoints Protégés

```powershell
# Récupérer les informations de l'utilisateur connecté
Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" `
  -Method Get `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

## Résolution des Problèmes

### Erreur: "User already exists in Keycloak"

**Solution**: Utilisez des valeurs uniques pour username et email, ou exécutez le script de nettoyage:
```powershell
.\CLEANUP_TEST_USERS.ps1
```

### Erreur: "Failed to connect to Keycloak"

**Vérifications**:
1. Keycloak est démarré sur le port 9090
2. Le realm "wordly-realm" existe
3. Le client "wordly-client" est configuré
4. Les credentials dans application.properties sont corrects

### Erreur: "Password is required"

**Solution**: Cette erreur a été corrigée. Si elle persiste:
1. Redémarrer le User Service dans IntelliJ
2. Vérifier que le code a été recompilé

### Erreur: "Internal Server Error" dans Keycloak Admin Console

**Solution**: 
1. Redémarrer Keycloak
2. Vérifier les logs dans la console Keycloak
3. Essayer de recréer le realm si nécessaire

## Flux Complet de Création d'Utilisateur

1. **Frontend/Client** envoie une requête POST à `/api/auth/register`
2. **AuthController** reçoit la requête et appelle `userService.createUser()`
3. **UserService** vérifie que username et email n'existent pas dans MySQL
4. **UserService** appelle `keycloakService.createKeycloakUser()`
5. **KeycloakService** vérifie que username et email n'existent pas dans Keycloak
6. **KeycloakService** crée l'utilisateur dans Keycloak avec username, email, password
7. **KeycloakService** assigne le rôle à l'utilisateur
8. **KeycloakService** retourne le keycloak_id
9. **UserService** crée l'utilisateur dans MySQL avec TOUS les attributs + keycloak_id
10. **UserService** retourne le UserDTO au controller
11. **AuthController** retourne la réponse au client

## Prochaines Étapes

1. ✅ Corriger les erreurs de validation password
2. ✅ Ajouter les vérifications de conflit dans KeycloakService
3. ✅ Créer le script de nettoyage
4. ⏳ Tester l'inscription avec différents rôles
5. ⏳ Tester l'authentification et l'obtention de token
6. ⏳ Intégrer avec le frontend Angular
7. ⏳ Ajouter la gestion des tokens dans les services Angular
