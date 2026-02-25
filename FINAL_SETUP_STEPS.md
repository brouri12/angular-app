# Étapes Finales - Configuration Complète

## ✅ État Actuel

- ✅ MySQL: Fonctionne (port 3307)
- ✅ User Service: Fonctionne (port 8085)
- ✅ Keycloak: Fonctionne (port 9090)
- ✅ Vous êtes connecté à Keycloak Admin Console

---

## 🎯 Ce qu'il Reste à Faire

### Étape 1: Créer le Realm "wordly-realm"

Vous êtes actuellement dans le realm "master". Vous devez créer un nouveau realm.

1. **En haut à gauche**, cliquez sur **"Keycloak"** (ou "master")
2. Vous verrez un menu déroulant
3. Cliquez sur **"Create realm"**
4. **Realm name**: `wordly-realm`
5. Cliquez sur **"Create"**

✅ Vous êtes maintenant dans le realm "wordly-realm"

---

### Étape 2: Créer les 3 Rôles

1. Dans le menu de gauche, cliquez sur **"Realm roles"**
2. Cliquez sur **"Create role"** (bouton en haut à droite)

**Créer ces 3 rôles:**

#### Rôle 1: ADMIN
- **Role name**: `ADMIN`
- **Description**: `Administrator role`
- Cliquez sur **"Save"**

#### Rôle 2: TEACHER
- Cliquez sur **"Create role"**
- **Role name**: `TEACHER`
- **Description**: `Teacher role`
- Cliquez sur **"Save"**

#### Rôle 3: STUDENT
- Cliquez sur **"Create role"**
- **Role name**: `STUDENT`
- **Description**: `Student role`
- Cliquez sur **"Save"**

✅ Vous avez maintenant 3 rôles

---

### Étape 3: Créer le Client "wordly-client"

1. Dans le menu de gauche, cliquez sur **"Clients"**
2. Cliquez sur **"Create client"** (bouton en haut à droite)

#### Page 1 - General Settings:
- **Client type**: `OpenID Connect` (par défaut)
- **Client ID**: `wordly-client`
- Cliquez sur **"Next"**

#### Page 2 - Capability config:
⚠️ **TRÈS IMPORTANT:**
- **Client authentication**: **ON** ✅ (ACTIVEZ cette option!)
- **Authorization**: OFF
- **Authentication flow**:
  - ✅ **Standard flow** (coché)
  - ✅ **Direct access grants** (coché)
  - ❌ Tout le reste (décoché)
- Cliquez sur **"Next"**

#### Page 3 - Login settings:
- **Root URL**: laissez vide
- **Home URL**: laissez vide
- **Valid redirect URIs**: Ajoutez ces 3 URLs:
  ```
  http://localhost:4200/*
  http://localhost:4201/*
  http://localhost:8085/*
  ```
  (Tapez chaque URL et cliquez sur le "+" pour l'ajouter)
- **Valid post logout redirect URIs**: Cliquez sur le **"+"**
- **Web origins**: `*`
- Cliquez sur **"Save"**

✅ Le client "wordly-client" est créé!

---

### Étape 4: Récupérer le Client Secret

1. Restez dans **"Clients"** → **"wordly-client"**
2. En haut, cliquez sur l'onglet **"Credentials"**
3. Vous verrez **"Client secret"** avec une longue chaîne
4. Cliquez sur l'icône de **copie** pour copier le secret

**Exemple de secret:**
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

5. **Mettez à jour `application.properties`:**

Ouvrez: `UserService/src/main/resources/application.properties`

Trouvez la ligne:
```properties
keycloak.credentials.secret=0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0
```

Remplacez par votre nouveau secret:
```properties
keycloak.credentials.secret=VOTRE_NOUVEAU_SECRET_ICI
```

6. **Redémarrez le User Service** dans IntelliJ

✅ Configuration Keycloak terminée!

---

## 🧪 Tests Finaux

### Test 1: Vérifier la connexion Keycloak

**Dans le navigateur:**
```
http://localhost:8085/api/auth/test-keycloak
```

**Résultat attendu:**
```json
{
  "status": "Connected to Keycloak",
  "realms_count": 2,
  "realms": ["master", "wordly-realm"]
}
```

---

### Test 2: Créer un utilisateur ADMIN

**Ouvrir Swagger:**
```
http://localhost:8085/swagger-ui.html
```

1. Trouvez **"auth-controller"**
2. Cliquez sur **POST /api/auth/register**
3. Cliquez sur **"Try it out"**
4. Copiez ce JSON:

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

**Résultat attendu:** Status 201 Created

```json
{
  "id_user": 1,
  "keycloak_id": "a1b2c3d4-...",
  "username": "admin",
  "email": "admin@wordly.com",
  "role": "ADMIN",
  "enabled": true,
  "nom": "Admin",
  "prenom": "System",
  "telephone": "+216 12345678",
  "poste": "Directeur"
}
```

---

### Test 3: Vérifier dans Keycloak

1. Retournez dans Keycloak Admin Console
2. Assurez-vous d'être dans le realm **"wordly-realm"**
3. Menu gauche → **"Users"**
4. Vous devriez voir l'utilisateur **"admin"**

✅ L'utilisateur est créé dans Keycloak ET dans MySQL!

---

### Test 4: Obtenir un Token

**Dans Postman ou un terminal:**

```bash
POST http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=wordly-client
&client_secret=VOTRE_SECRET
&username=admin
&password=admin123
```

**Résultat attendu:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "token_type": "Bearer"
}
```

**Copiez le `access_token`!**

---

### Test 5: Utiliser le Token

**Dans Swagger:**

1. En haut à droite, cliquez sur **"Authorize"** (cadenas)
2. Dans le champ **"Value"**, tapez:
   ```
   Bearer VOTRE_ACCESS_TOKEN
   ```
3. Cliquez sur **"Authorize"**
4. Cliquez sur **"Close"**

**Maintenant testez un endpoint protégé:**

1. Trouvez **"user-controller"**
2. Cliquez sur **GET /api/users**
3. Cliquez sur **"Try it out"**
4. Cliquez sur **"Execute"**

**Résultat attendu:** Liste des utilisateurs (au moins l'admin)

---

## 📊 Vérification Complète

### Dans MySQL

Connectez-vous à MySQL et vérifiez:

```sql
USE user_db;
SELECT * FROM users;
```

Vous devriez voir l'utilisateur admin.

### Dans Keycloak

1. Realm: **wordly-realm**
2. Users: Vous voyez **admin**
3. Roles: Vous voyez **ADMIN**, **TEACHER**, **STUDENT**
4. Clients: Vous voyez **wordly-client**

---

## 🎉 Si Tous les Tests Passent

**Félicitations!** Votre système d'authentification fonctionne!

Vous avez maintenant:
- ✅ Keycloak configuré
- ✅ User Service fonctionnel
- ✅ Synchronisation Keycloak ↔ MySQL
- ✅ Authentification JWT
- ✅ Gestion des rôles

---

## 🚀 Prochaines Étapes

### 1. Créer Plus d'Utilisateurs

Créez un TEACHER:
```json
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

Créez un STUDENT:
```json
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

### 2. Intégrer avec le Frontend

- Créer un service Angular pour l'authentification
- Ajouter une page de login
- Ajouter une page de register
- Gérer les tokens dans localStorage
- Protéger les routes

### 3. Intégrer avec le Back-Office

- Ajouter la gestion des utilisateurs
- Afficher les statistiques
- CRUD complet pour les utilisateurs

---

## 🔧 Dépannage

### Erreur: "Failed to connect to Keycloak"
- Vérifiez que Keycloak tourne: http://localhost:9090
- Vérifiez le client secret dans application.properties
- Redémarrez le User Service

### Erreur: "User already exists"
- L'utilisateur existe déjà dans Keycloak ou MySQL
- Utilisez un autre username/email

### Erreur: "Invalid credentials"
- Vérifiez le client secret
- Vérifiez que le realm "wordly-realm" existe
- Vérifiez que les rôles existent

### Token expiré
- Les tokens expirent après 5 minutes
- Obtenez un nouveau token
- Ou utilisez le refresh_token

---

## 📝 Checklist Finale

Avant de continuer:

- [ ] Realm "wordly-realm" créé
- [ ] 3 rôles créés (ADMIN, TEACHER, STUDENT)
- [ ] Client "wordly-client" créé
- [ ] Client authentication = ON
- [ ] Client secret copié dans application.properties
- [ ] User Service redémarré
- [ ] Test connexion Keycloak: OK
- [ ] Test inscription admin: OK
- [ ] Test obtenir token: OK
- [ ] Test endpoint protégé: OK
- [ ] Utilisateur visible dans Keycloak
- [ ] Utilisateur visible dans MySQL

---

**Dernière mise à jour**: 19 Février 2026, 02:20
**État**: Prêt pour la configuration finale!
