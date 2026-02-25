# Tests Rapides - User Service

## ✅ Service Démarré!

Le User Service tourne maintenant sur http://localhost:8085

---

## Test 1: Vérifier que le service répond

**Dans le navigateur:**
```
http://localhost:8085/api/users/hello
```

**Résultat attendu:**
```
Bienvenue dans le microservice de gestion des utilisateurs!
```

---

## Test 2: Tester la connexion Keycloak

**Dans le navigateur:**
```
http://localhost:8085/api/auth/test-keycloak
```

**Si Keycloak fonctionne:**
```json
{
  "status": "Connected to Keycloak",
  "realms_count": 2,
  "realms": ["master", "wordly-realm"]
}
```

**Si Keycloak ne fonctionne pas:**
```json
{
  "error": "Failed to connect to Keycloak",
  "message": "..."
}
```

---

## Test 3: Inscription (IMPORTANT: Utiliser POST, pas GET!)

### ❌ ERREUR - Ne PAS faire:
```
GET http://localhost:8085/api/auth/register
```

### ✅ CORRECT - Faire:

**Dans Swagger (http://localhost:8085/swagger-ui.html):**

1. Allez dans **"auth-controller"**
2. Cliquez sur **POST /api/auth/register**
3. Cliquez sur **"Try it out"**
4. Utilisez ce JSON:

```json
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

5. Cliquez sur **"Execute"**

---

## Test 4: Vérifier Swagger

**Ouvrir dans le navigateur:**
```
http://localhost:8085/swagger-ui.html
```

Vous devriez voir tous les endpoints disponibles.

---

## Erreurs Courantes

### Erreur 500 Internal Server Error

**Cause probable:** Keycloak n'est pas accessible

**Solution:**
1. Vérifier que Keycloak tourne sur http://localhost:9090
2. Tester: http://localhost:8085/api/auth/test-keycloak
3. Si erreur, démarrer/réparer Keycloak

### Erreur 401 Unauthorized

**Cause:** Vous essayez d'accéder à un endpoint protégé sans token

**Solution:** Utiliser les endpoints publics:
- `/api/users/hello` ✅
- `/api/auth/info` ✅
- `/api/auth/register` ✅ (POST uniquement!)
- `/api/auth/test-keycloak` ✅

### GET au lieu de POST

**Erreur:**
```
GET http://localhost:8085/api/auth/register
```

**Correct:**
```
POST http://localhost:8085/api/auth/register
Content-Type: application/json

{ ... données JSON ... }
```

---

## Ordre des Tests

1. ✅ Test 1: Hello endpoint → Vérifier que le service répond
2. ✅ Test 2: Test Keycloak → Vérifier la connexion Keycloak
3. ⏳ Test 3: Inscription → Créer un utilisateur (si Keycloak OK)
4. ⏳ Test 4: Login Keycloak → Obtenir un token
5. ⏳ Test 5: Endpoints protégés → Utiliser le token

---

## Commandes Utiles

### Vérifier les services qui tournent:
```powershell
# MySQL
netstat -ano | findstr :3307

# User Service
netstat -ano | findstr :8085

# Keycloak
netstat -ano | findstr :9090
```

### Voir les logs User Service:
Regardez la console IntelliJ pour voir les erreurs détaillées.

---

## État Actuel

- ✅ MySQL: Tourne sur port 3307
- ✅ User Service: Tourne sur port 8085
- ⚠️ Keycloak: À vérifier (port 9090)

**Prochaine étape:** Tester la connexion Keycloak avec Test 2
