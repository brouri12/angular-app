# Guide Pas à Pas: Configuration du Realm Keycloak

## Vous êtes maintenant dans l'interface admin Keycloak ✅

### ÉTAPE 1: Créer le Realm "wordly-realm"

1. **En haut à gauche**, vous voyez "Keycloak" avec une flèche vers le bas
2. Cliquez sur cette flèche
3. Vous verrez "master" (le realm par défaut)
4. Cliquez sur **"Create realm"**
5. Dans le formulaire:
   - **Realm name**: `wordly-realm`
   - **Enabled**: ON (activé par défaut)
6. Cliquez sur **"Create"**

✅ Vous êtes maintenant dans le realm "wordly-realm"

---

### ÉTAPE 2: Créer les Rôles

1. Dans le menu de gauche, cliquez sur **"Realm roles"**
2. Cliquez sur **"Create role"** (bouton en haut à droite)

#### Créer le rôle ADMIN:
- **Role name**: `ADMIN`
- **Description**: `Administrator role`
- Cliquez sur **"Save"**

#### Créer le rôle TEACHER:
- Cliquez à nouveau sur **"Create role"**
- **Role name**: `TEACHER`
- **Description**: `Teacher role`
- Cliquez sur **"Save"**

#### Créer le rôle STUDENT:
- Cliquez à nouveau sur **"Create role"**
- **Role name**: `STUDENT`
- **Description**: `Student role`
- Cliquez sur **"Save"**

✅ Vous avez maintenant 3 rôles: ADMIN, TEACHER, STUDENT

---

### ÉTAPE 3: Créer le Client "wordly-client"

1. Dans le menu de gauche, cliquez sur **"Clients"**
2. Cliquez sur **"Create client"** (bouton en haut à droite)

#### Page 1 - General Settings:
- **Client type**: `OpenID Connect`
- **Client ID**: `wordly-client`
- Cliquez sur **"Next"**

#### Page 2 - Capability config:
- **Client authentication**: **ON** ✅ (très important!)
- **Authorization**: OFF
- **Authentication flow**:
  - ✅ **Standard flow** (coché)
  - ✅ **Direct access grants** (coché)
  - ❌ Implicit flow (décoché)
  - ❌ Service accounts roles (décoché)
- Cliquez sur **"Next"**

#### Page 3 - Login settings:
- **Root URL**: laissez vide
- **Home URL**: laissez vide
- **Valid redirect URIs**: 
  ```
  http://localhost:4200/*
  http://localhost:4201/*
  http://localhost:8085/*
  ```
  (Ajoutez chaque URL une par une en cliquant sur le "+" après chaque)
- **Valid post logout redirect URIs**: `+` (cliquez sur le +)
- **Web origins**: `*`
- Cliquez sur **"Save"**

✅ Le client "wordly-client" est créé!

---

### ÉTAPE 4: Récupérer le Client Secret

1. Restez dans **"Clients"** → **"wordly-client"**
2. Cliquez sur l'onglet **"Credentials"** (en haut)
3. Vous verrez **"Client secret"** avec une valeur comme: `0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0`
4. **Copiez cette valeur** (cliquez sur l'icône de copie)

⚠️ **IMPORTANT**: Cette valeur est déjà dans votre `application.properties`, mais vérifiez qu'elle correspond!

---

### ÉTAPE 5: Vérification Finale

Vérifiez que tout est bien configuré:

#### Dans Realm roles:
- [ ] ADMIN existe
- [ ] TEACHER existe
- [ ] STUDENT existe

#### Dans Clients → wordly-client:
- [ ] Client authentication = ON
- [ ] Standard flow = activé
- [ ] Direct access grants = activé
- [ ] Valid redirect URIs contient les 3 URLs
- [ ] Client secret est copié

---

## Configuration Terminée! ✅

Votre Keycloak est maintenant prêt. Prochaines étapes:

1. **Démarrer MySQL** sur le port 3307
2. **Démarrer le User Service** (port 8085)
3. **Tester l'inscription** d'un utilisateur
4. **Tester l'authentification** avec Keycloak

---

## Commandes pour Tester

### 1. Créer un utilisateur (via User Service):
```bash
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

### 2. Obtenir un token (via Keycloak):
```bash
POST http://localhost:9090/realms/wordly-realm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&client_id=wordly-client&client_secret=VOTRE_SECRET&username=admin&password=admin123
```

### 3. Utiliser le token (via User Service):
```bash
GET http://localhost:8085/api/users/me
Authorization: Bearer VOTRE_TOKEN
```

---

## Troubleshooting

### Si vous ne voyez pas "Create realm":
- Vous êtes peut-être déjà dans un realm
- Cliquez sur le nom du realm en haut à gauche pour revenir au menu

### Si "Client authentication" n'est pas disponible:
- Vérifiez que vous avez sélectionné "OpenID Connect" comme Client type

### Si vous avez une erreur lors de la création:
- Vérifiez que le nom est unique
- Vérifiez qu'il n'y a pas d'espaces dans les noms

---

## Prochaine Étape: Démarrer MySQL

Keycloak est configuré! Maintenant vous devez:

1. **Démarrer MySQL** sur le port 3307
2. Le User Service pourra alors se connecter à la base de données
3. Vous pourrez tester l'inscription et l'authentification

**Commande pour vérifier MySQL:**
```bash
mysql -u root -P 3307 -h localhost
```

Si MySQL n'est pas démarré, lancez-le avec XAMPP, WAMP, ou votre gestionnaire MySQL habituel.
