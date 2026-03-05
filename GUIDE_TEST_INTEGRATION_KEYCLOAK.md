
# Guide Complet de Test de l'Intégration Keycloak

Ce guide vous permettra de tester l'intégration Keycloak de manière complète et structurée.

---

## PRÉREQUIS

Assurez-vous d'avoir :
1. ✅ Keycloak démarré sur http://localhost:8180
2. ✅ Realm "gestions-ramzi" créé
3. ✅ Client "frontend-app" créé
4. ✅ Utilisateur "admin" créé avec mot de passe "admin123"
5. ✅ Rôle ADMIN assigné à l'utilisateur admin

---

## ÉTAPE 1 : Vérifier que Keycloak fonctionne

### 1.1 Tester l'endpoint OpenID Configuration
Ouvrez votre navigateur et allez sur :
```
http://localhost:8180/realms/gestions-ramzi/.well-known/openid-configuration
```

**Résultat attendu** : Une page JSON avec les informations de configuration OIDC.

### 1.2 Tester l'obtention d'un token
Utilisez curl ou Postman pour obtenir un token :

```cmd
curl -X POST http://localhost:8180/realms/gestions-ramzi/protocol/openid-connect/token ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "grant_type=password" ^
  -d "client_id=frontend-app" ^
  -d "username=admin" ^
  -d "password=admin123"
```

**Résultat attendu** : Un JSON contenant :
- `access_token` (très long)
- `refresh_token`
- `token_type` : "Bearer"
- `expires_in` : 300 (ou autre)

---

## ÉTAPE 2 : Préparer les services Backend

### 2.1 Vérifier MySQL
Assurez-vous que MySQL est démarré et que les bases de données existent :
- `gestion_users` (pour service-user)
- `skillforge_feedback` (pour service-feedback)

### 2.2 Vérifier Eureka (optionnel)
Si vous utilisez Eureka, asegurez-vous qu'il est démarré sur http://localhost:8761

---

## ÉTAPE 3 : Démarrer les Microservices

### 3.1 Démarrer service-user

Ouvrir un nouveau terminal et exécuter :

```cmd
cd c:\Users\MSI\Downloads\PI\Gestions_Ramzi\microservices\service-user
mvn spring-boot:run
```

**Attendre** que le service démarre (environ 30-60 secondes).
**Vérifier** dans la console : `Started ServiceUserApplication in X seconds`

### 3.2 Démarrer service-feedback

Ouvrir un autre terminal et exécuter :

```cmd
cd c:\Users\MSI\Downloads\PI\Gestions_Ramzi\microservices\service-feedback
mvn spring-boot:run
```

**Attendre** que le service démarre.
**Vérifier** dans la console : `Started ServiceFeedbackApplication in X seconds`

---

## ÉTAPE 4 : Tester les API avec Postman/cURL

### 4.1 Obtenir un token d'abord

```cmd
curl -X POST http://localhost:8180/realms/gestions-ramzi/protocol/openid-connect/token ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "grant_type=password" ^
  -d "client_id=frontend-app" ^
  -d "username=admin" ^
  -d "password=admin123"
```

Copier la valeur de `access_token` (sans les guillemets).

### 4.2 Tester service-user (protégé)

```cmd
curl -X GET http://localhost:8081/api/users ^
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

**Résultat attendu** : Liste des utilisateurs ou accès refusé (401) si le token n'est pas valide.

### 4.3 Tester service-feedback (protégé)

```cmd
curl -X GET http://localhost:8082/api/feedbacks ^
  -H "Authorization: Bearer VOTRE_ACCESS_TOKEN"
```

---

## ÉTAPE 5 : Tester le Frontend Angular

### 5.1 Installer les dépendances (si pas fait)

```cmd
cd c:\Users\MSI\Downloads\PI\Gestions_Ramzi\frontend\angular-app
npm install
```

### 5.2 Démarrer le frontend

```cmd
npm start
```

Le frontend démarre sur http://localhost:4200

### 5.3 Tester le flux OAuth2

1. **Ouvrir** http://localhost:4200 dans votre navigateur
2. **Vérifier** que vous êtes redirigé vers Keycloak (http://localhost:8180/realms/gestions-ramzi/protocol/openid-connect/auth/...)
3. **Se connecter** avec :
   - Username : `admin`
   - Password : `admin123`
4. **Vérifier** que vous êtes redirigé vers l'application Angular
5. **Vérifier** que le token JWT est stocké (dans localStorage ou sessionStorage)

---

## ÉTAPE 6 : Vérifications de Debug

### 6.1 Dans le navigateur (F12)

1. Ouvrir les Developer Tools (F12)
2. Aller dans l'onglet **Application** → **Local Storage**
3. Chercher `access_token` ou `id_token`

### 6.2 Dans l'onglet Network

1. Faire une action dans l'app (ex: charger les feedbacks)
2. Chercher une requête vers `/api/feedbacks`
3. Dans les Headers, vérifier :
   - `Authorization: Bearer eyJ...` (présence du token)

### 6.3 Dans la console JavaScript

Dans la console du navigateur, taper :

```javascript
// Vérifier si connecté
console.log('Logged in:', authService.isLoggedIn);

// Afficher le token
console.log('Token:', authService.token);

// Afficher les rôles
console.log('Roles:', authService.roles);

// Afficher l'ID utilisateur
console.log('User ID:', authService.userId);
```

---

## PROBLÈMES COURANTS ET SOLUTIONS

### Problème 1 : "401 Unauthorized"

**Cause** : Token JWT invalide ou expiré.

**Solution** :
1. Obtenir un nouveau token
2. Vérifier que le token est envoyé dans les requêtes

---

### Problème 2 : "CORS error"

**Cause** : Le frontend et le backend n'ont pas les mêmes origins.

**Solution** :
1. Vérifier la configuration CORS dans `application.yml`
2. Ajouter `http://localhost:4200` dans les origins autorisées

---

### Problème 3 : "Connection refused" sur les microservices

**Cause** : Les services ne sont pas démarrés.

**Solution** :
1. Vérifier que MySQL est démarré
2. Redémarrer les microservices
3. Vérifier les logs pour les erreurs

---

### Problème 4 : "Issuer URI mismatch"

**Cause** : L'issuer dans les fichiers config ne correspond pas à Keycloak.

**Solution** :
Vérifier que `application.yml` contient :
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/gestions-ramzi
```

---

## CHECKLIST FINALE

| Test | Status |
|------|--------|
| Keycloak accessible sur http://localhost:8180 | ☐ |
| Token obtenu avec curl | ☐ |
| service-user démarre sur port 8081 | ☐ |
| service-feedback démarre sur port 8082 | ☐ |
| API service-user répond avec token | ☐ |
| API service-feedback répond avec token | ☐ |
| Frontend Angular démarre sur port 4200 | ☐ |
| Redirection vers Keycloak au chargement | ☐ |
| Connexion avec admin/admin123 réussie | ☐ |
| Token JWT visible dans le navigateur | ☐ |
| Requêtes API avec Bearer Token | ☐ |

---

## COMMANDES RAPIDES

### Obtenir un token
```cmd
curl -X POST http://localhost:8180/realms/gestions-ramzi/protocol/openid-connect/token -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=password" -d "client_id=frontend-app" -d "username=admin" -d "password=admin123"
```

### Tester service-user
```cmd
curl -X GET http://localhost:8081/api/users -H "Authorization: Bearer VOTRE_TOKEN"
```

### Tester service-feedback
```cmd
curl -X GET http://localhost:8082/api/feedbacks -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## NOTES

- Le token JWT expire après 5 minutes (300 secondes) par défaut
- Pour un test plus long, modifier `Access Token Lifespan` dans Keycloak (Realm Settings → Tokens)
- Le token doit être renouvelé via le `refresh_token` pour des sessions longues


