# Debug: Erreur Keycloak 500

## Erreur Actuelle

```
Failed to create user in Keycloak: Internal Server Error
```

---

## Causes Possibles

### 1. Le Realm "wordly-realm" n'existe pas ❌

**Vérification:**
1. Allez dans Keycloak Admin Console: http://localhost:9090
2. En haut à gauche, vérifiez le nom du realm
3. Si vous voyez "master" au lieu de "wordly-realm", c'est le problème!

**Solution:**
- Créez le realm "wordly-realm" (voir FINAL_SETUP_STEPS.md, Étape 1)

---

### 2. Les Rôles n'existent pas ❌

Le code essaie d'assigner un rôle (ADMIN, TEACHER, ou STUDENT) qui n'existe pas dans Keycloak.

**Vérification:**
1. Dans Keycloak, assurez-vous d'être dans le realm "wordly-realm"
2. Menu gauche → "Realm roles"
3. Vérifiez que vous voyez: ADMIN, TEACHER, STUDENT

**Solution:**
- Créez les 3 rôles (voir FINAL_SETUP_STEPS.md, Étape 2)

---

### 3. Problème de Connexion Admin ❌

Le User Service utilise le compte admin du realm "master" pour créer des utilisateurs.

**Vérification dans application.properties:**
```properties
keycloak.admin.realm=master
keycloak.admin.client-id=admin-cli
keycloak.admin.username=admin
keycloak.admin.password=admin
```

**Solution:**
- Vérifiez que ces credentials sont corrects
- Testez: http://localhost:8085/api/auth/test-keycloak

---

### 4. Le Client "wordly-client" n'existe pas ❌

Bien que ce ne soit pas directement lié à la création d'utilisateur, c'est nécessaire pour l'authentification.

**Vérification:**
1. Dans Keycloak, realm "wordly-realm"
2. Menu gauche → "Clients"
3. Vérifiez que "wordly-client" existe

**Solution:**
- Créez le client (voir FINAL_SETUP_STEPS.md, Étape 3)

---

## 🔍 Diagnostic Étape par Étape

### Étape 1: Vérifier la Connexion Keycloak

**Test:**
```
http://localhost:8085/api/auth/test-keycloak
```

**Si ça fonctionne:**
```json
{
  "status": "Connected to Keycloak",
  "realms_count": 2,
  "realms": ["master", "wordly-realm"]
}
```

**Si "wordly-realm" n'apparaît pas:**
→ Le realm n'existe pas, créez-le!

---

### Étape 2: Vérifier les Logs IntelliJ

Dans la console IntelliJ, cherchez des erreurs comme:

```
realm not found
role not found
user already exists
invalid credentials
```

Ces messages vous diront exactement quel est le problème.

---

### Étape 3: Tester Manuellement dans Keycloak

Pour vérifier que Keycloak fonctionne, créez un utilisateur manuellement:

1. Keycloak Admin Console
2. Realm: **wordly-realm** (pas master!)
3. Menu "Users" → "Add user"
4. Username: `testuser`
5. Email: `test@wordly.com`
6. Email verified: ON
7. Cliquez "Create"
8. Onglet "Credentials" → "Set password"
9. Password: `test123`
10. Temporary: OFF
11. Cliquez "Save"

**Si ça fonctionne:**
→ Keycloak est OK, le problème vient de la configuration du User Service

**Si ça ne fonctionne pas:**
→ Problème avec Keycloak lui-même

---

## ✅ Checklist de Configuration

Avant de tester l'inscription, vérifiez:

### Dans Keycloak:
- [ ] Realm "wordly-realm" existe
- [ ] Vous êtes dans le realm "wordly-realm" (pas master)
- [ ] Rôle "ADMIN" existe
- [ ] Rôle "TEACHER" existe
- [ ] Rôle "STUDENT" existe
- [ ] Client "wordly-client" existe (optionnel pour l'instant)

### Dans User Service:
- [ ] MySQL tourne (port 3307)
- [ ] User Service tourne (port 8085)
- [ ] Test Keycloak retourne success
- [ ] application.properties a les bons credentials admin

---

## 🛠️ Solution Rapide

**Si vous n'avez PAS encore créé le realm et les rôles:**

1. **Créer le Realm:**
   - Keycloak → "Create realm"
   - Name: `wordly-realm`
   - Create

2. **Créer les Rôles:**
   - Realm roles → "Create role"
   - Créez: `ADMIN`, `TEACHER`, `STUDENT`

3. **Retester l'inscription:**
   - Swagger → POST /api/auth/register
   - Utilisez le JSON de test

**Ça devrait fonctionner maintenant!**

---

## 📋 Ordre Correct des Opérations

1. ✅ Démarrer Keycloak
2. ✅ Se connecter à l'admin console
3. ⚠️ **Créer le realm "wordly-realm"** ← VOUS ÊTES ICI
4. ⚠️ **Créer les 3 rôles**
5. ⏳ Créer le client "wordly-client"
6. ⏳ Tester l'inscription
7. ⏳ Obtenir un token
8. ⏳ Tester les endpoints protégés

---

## 🔄 Si Vous Avez Déjà Créé le Realm et les Rôles

**Vérifiez que vous êtes dans le BON realm:**

1. En haut à gauche de Keycloak
2. Vous devez voir **"wordly-realm"** (pas "master")
3. Si vous voyez "master", cliquez dessus et sélectionnez "wordly-realm"

**Vérifiez les rôles:**
1. Menu "Realm roles"
2. Vous devez voir au moins: ADMIN, TEACHER, STUDENT

**Si tout est OK mais ça ne fonctionne toujours pas:**
- Regardez les logs IntelliJ pour l'erreur exacte
- Testez http://localhost:8085/api/auth/test-keycloak
- Vérifiez que "wordly-realm" apparaît dans la liste des realms

---

## 💡 Astuce

Le message d'erreur "Internal Server Error" est vague. Pour voir l'erreur exacte:

1. Regardez la console IntelliJ
2. Cherchez les lignes en rouge après avoir cliqué "Execute"
3. L'erreur détaillée vous dira exactement ce qui manque

**Exemples d'erreurs courantes:**
- `realm not found` → Créez le realm
- `role ADMIN not found` → Créez les rôles
- `user already exists` → Utilisez un autre username
- `invalid credentials` → Vérifiez admin username/password

---

## 🎯 Action Immédiate

**Faites ceci MAINTENANT:**

1. Ouvrez Keycloak: http://localhost:9090
2. Vérifiez le nom du realm en haut à gauche
3. Si ce n'est pas "wordly-realm", créez-le
4. Créez les 3 rôles: ADMIN, TEACHER, STUDENT
5. Retestez l'inscription

**Ça devrait résoudre le problème!**
