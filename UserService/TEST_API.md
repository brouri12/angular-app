# Guide de Test - User Service API

## URLs Importantes

- **User Service**: http://localhost:8085
- **Swagger UI**: http://localhost:8085/swagger-ui.html
- **Keycloak**: http://localhost:9090
- **Keycloak Token Endpoint**: http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token

---

## ÉTAPE 1: Tester les Endpoints Publics

### 1.1 Test Hello (Public)
```http
GET http://localhost:8085/api/users/hello
```

**Réponse attendue:**
```
Bienvenue dans le microservice de gestion des utilisateurs!
```

### 1.2 Test Info (Public)
```http
GET http://localhost:8085/api/auth/info
```

**Réponse attendue:**
```
Pour vous connecter, utilisez Keycloak: http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token
```

---

## ÉTAPE 2: Créer des Utilisateurs (Public - Inscription)

### 2.1 Créer un ADMIN
```http
POST http://localhost:8085/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@wordly.com",
  "password": "admin123",
  "role": "ADMIN",
  "nom": "Admin",
  "prenom": "System",
  "telephone": "+216 12345678",
  "poste": "Directeur"
}
```

### 2.2 Créer un TEACHER
```http
POST http://localhost:8085/api/auth/register
Content-Type: application/json

{
  "username": "teacher1",
  "email": "teacher1@wordly.com",
  "password": "teacher123",
  "role": "TEACHER",
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+216 23456789",
  "specialite": "Mathématiques",
  "experience": 5,
  "disponibilite": "Lundi, Mercredi, Vendredi"
}
```

### 2.3 Créer un STUDENT
```http
POST http://localhost:8085/api/auth/register
Content-Type: application/json

{
  "username": "student1",
  "email": "student1@wordly.com",
  "password": "student123",
  "role": "STUDENT",
  "nom": "Martin",
  "prenom": "Sophie",
  "telephone": "+216 34567890",
  "date_naissance": "2000-05-15",
  "niveau_actuel": "Licence 2",
  "statut_etudiant": "Inscrit"
}
```

**Réponse attendue (exemple):**
```json
{
  "id_user": 1,
  "keycloak_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "username": "admin",
  "email": "admin@wordly.com",
  "role": "ADMIN",
  "enabled": true,
  "date_creation": "2026-02-18T17:55:00",
  "nom": "Admin",
  "prenom": "System",
  "telephone": "+216 12345678",
  "poste": "Directeur"
}
```

---

## ÉTAPE 3: Obtenir un Token Keycloak

### 3.1 Login avec Admin
```http
POST http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&client_id=wordly-client&client_secret=0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0&username=admin&password=admin123
```

### 3.2 Login avec Teacher
```http
POST http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&client_id=wordly-client&client_secret=0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0&username=teacher1&password=teacher123
```

### 3.3 Login avec Student
```http
POST http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&client_id=wordly-client&client_secret=0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0&username=student1&password=student123
```

**Réponse attendue:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJxxx...",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJyyy...",
  "token_type": "Bearer",
  "not-before-policy": 0,
  "session_state": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "scope": "profile email"
}
```

⚠️ **Copiez le `access_token`** pour l'utiliser dans les requêtes suivantes!

---

## ÉTAPE 4: Tester les Endpoints Protégés (avec Token)

### 4.1 Récupérer l'utilisateur connecté
```http
GET http://localhost:8085/api/auth/me
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

### 4.2 Récupérer tous les utilisateurs
```http
GET http://localhost:8085/api/users
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

### 4.3 Récupérer un utilisateur par ID
```http
GET http://localhost:8085/api/users/1
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

### 4.4 Récupérer les utilisateurs par rôle
```http
GET http://localhost:8085/api/users/role/TEACHER
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

### 4.5 Rechercher des utilisateurs
```http
GET http://localhost:8085/api/users/search?query=admin
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

### 4.6 Récupérer les statistiques
```http
GET http://localhost:8085/api/users/stats
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

### 4.7 Mettre à jour un utilisateur
```http
PUT http://localhost:8085/api/users/1
Authorization: Bearer VOTRE_ACCESS_TOKEN
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@wordly.com",
  "password": "admin123",
  "role": "ADMIN",
  "nom": "Admin",
  "prenom": "System Updated",
  "telephone": "+216 12345678",
  "poste": "Directeur Général"
}
```

### 4.8 Activer/Désactiver un utilisateur
```http
PATCH http://localhost:8085/api/users/1/toggle-status
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

### 4.9 Supprimer un utilisateur
```http
DELETE http://localhost:8085/api/users/1
Authorization: Bearer VOTRE_ACCESS_TOKEN
```

---

## ÉTAPE 5: Utiliser Swagger UI

1. Ouvrez: http://localhost:8085/swagger-ui.html
2. Cliquez sur **"Authorize"** (cadenas en haut à droite)
3. Dans le champ **"Value"**, entrez: `Bearer VOTRE_ACCESS_TOKEN`
4. Cliquez sur **"Authorize"**
5. Cliquez sur **"Close"**
6. Maintenant vous pouvez tester tous les endpoints protégés!

---

## Résumé des Endpoints

### Endpoints Publics (sans token)
- ✅ `GET /api/users/hello` - Test de connexion
- ✅ `GET /api/auth/info` - Information sur l'authentification
- ✅ `POST /api/auth/register` - Inscription d'un utilisateur

### Endpoints Protégés (avec token)
- 🔒 `GET /api/auth/me` - Utilisateur connecté
- 🔒 `GET /api/users` - Tous les utilisateurs
- 🔒 `GET /api/users/{id}` - Utilisateur par ID
- 🔒 `GET /api/users/username/{username}` - Utilisateur par username
- 🔒 `GET /api/users/email/{email}` - Utilisateur par email
- 🔒 `GET /api/users/role/{role}` - Utilisateurs par rôle
- 🔒 `GET /api/users/enabled/{enabled}` - Utilisateurs actifs/inactifs
- 🔒 `GET /api/users/search?query=` - Recherche
- 🔒 `GET /api/users/students/statut/{statut}` - Étudiants par statut
- 🔒 `GET /api/users/teachers/specialite?specialite=` - Enseignants par spécialité
- 🔒 `GET /api/users/stats` - Statistiques
- 🔒 `PUT /api/users/{id}` - Mettre à jour
- 🔒 `PATCH /api/users/{id}/toggle-status` - Activer/Désactiver
- 🔒 `DELETE /api/users/{id}` - Supprimer

---

## Troubleshooting

### Erreur 401 Unauthorized
- ✅ Vérifiez que vous utilisez `/api/auth/register` pour l'inscription (pas `/api/users`)
- ✅ Vérifiez que vous avez un token valide pour les endpoints protégés
- ✅ Vérifiez que le token commence par "Bearer " dans le header Authorization

### Erreur 500 Internal Server Error
- ✅ Vérifiez que MySQL est démarré sur le port 3307
- ✅ Vérifiez que Keycloak est démarré sur le port 9090
- ✅ Vérifiez les logs du User Service

### Token expiré
- Les tokens expirent après 5 minutes (300 secondes)
- Utilisez le `refresh_token` pour obtenir un nouveau token
- Ou reconnectez-vous via Keycloak

### Keycloak ne répond pas
- Vérifiez que Keycloak est démarré: http://localhost:9090
- Vérifiez que le realm "wordly-realm" existe
- Vérifiez que le client "wordly-client" est configuré

---

## Prochaines Étapes

1. ✅ Tester l'inscription via `/api/auth/register`
2. ✅ Obtenir un token via Keycloak
3. ✅ Tester les endpoints protégés avec le token
4. 🔄 Intégrer avec le frontend Angular
5. 🔄 Intégrer avec le back-office
6. 🔄 Ajouter la gestion des refresh tokens
