# Guide de Réparation Keycloak - Erreur d'Authentification

## Erreur: "Unexpected error when handling authentication request to identity provider"

Cette erreur signifie que la configuration Keycloak est incomplète ou incorrecte.

---

## Solution Rapide: Reconfigurer Keycloak Complètement

### ÉTAPE 1: Arrêter Keycloak

Dans le terminal PowerShell où Keycloak tourne:
```powershell
# Appuyez sur Ctrl+C pour arrêter Keycloak
```

### ÉTAPE 2: Supprimer les Données Keycloak (Fresh Start)

```powershell
cd C:\keycloak-23.0.0
Remove-Item -Recurse -Force data
```

### ÉTAPE 3: Redémarrer Keycloak

```powershell
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

Attendez que Keycloak démarre complètement (environ 30 secondes).

### ÉTAPE 4: Créer l'Admin (si nécessaire)

Si Keycloak vous demande de créer un admin:
1. Ouvrez http://localhost:9090
2. Créez l'admin:
   - Username: `admin`
   - Password: `admin`

---

## Configuration Complète du Realm

### ÉTAPE 1: Créer le Realm "wordly-realm"

1. Connectez-vous à http://localhost:9090 (admin/admin)
2. Cliquez sur le dropdown "Keycloak" (en haut à gauche)
3. Cliquez sur **"Create realm"**
4. **Realm name**: `wordly-realm`
5. Cliquez sur **"Create"**

✅ Vous êtes maintenant dans le realm "wordly-realm"

---

### ÉTAPE 2: Créer les Rôles

1. Menu gauche → **"Realm roles"**
2. Cliquez sur **"Create role"**

Créez ces 3 rôles:

#### Rôle 1: ADMIN
- Role name: `ADMIN`
- Description: `Administrator role`
- Cliquez sur **"Save"**

#### Rôle 2: TEACHER
- Cliquez sur **"Create role"**
- Role name: `TEACHER`
- Description: `Teacher role`
- Cliquez sur **"Save"**

#### Rôle 3: STUDENT
- Cliquez sur **"Create role"**
- Role name: `STUDENT`
- Description: `Student role`
- Cliquez sur **"Save"**

✅ Vous avez maintenant 3 rôles

---

### ÉTAPE 3: Créer le Client "wordly-client"

1. Menu gauche → **"Clients"**
2. Cliquez sur **"Create client"**

#### Page 1 - General Settings:
- **Client type**: `OpenID Connect` (sélectionné par défaut)
- **Client ID**: `wordly-client`
- Cliquez sur **"Next"**

#### Page 2 - Capability config:
⚠️ **TRÈS IMPORTANT:**
- **Client authentication**: **ON** ✅ (activez cette option!)
- **Authorization**: OFF (désactivé)
- **Authentication flow**:
  - ✅ **Standard flow** (coché)
  - ✅ **Direct access grants** (coché)
  - ❌ Implicit flow (décoché)
  - ❌ Service accounts roles (décoché)
  - ❌ OAuth 2.0 Device Authorization Grant (décoché)
  - ❌ OIDC CIBA Grant (décoché)
- Cliquez sur **"Next"**

#### Page 3 - Login settings:
- **Root URL**: laissez vide
- **Home URL**: laissez vide
- **Valid redirect URIs**: Ajoutez ces 3 URLs (une par une):
  ```
  http://localhost:4200/*
  ```
  (Cliquez sur le "+" pour ajouter)
  ```
  http://localhost:4201/*
  ```
  (Cliquez sur le "+" pour ajouter)
  ```
  http://localhost:8085/*
  ```
  (Cliquez sur le "+" pour ajouter)
- **Valid post logout redirect URIs**: Cliquez sur le **"+"** (cela copie les redirect URIs)
- **Web origins**: Tapez `*` (astérisque)
- Cliquez sur **"Save"**

✅ Le client est créé!

---

### ÉTAPE 4: Récupérer le Client Secret

1. Restez dans **"Clients"** → **"wordly-client"**
2. En haut, vous devriez voir plusieurs onglets:
   - Settings
   - Roles
   - **Credentials** ← Cliquez ici
   - Client scopes
   - Advanced
   - Sessions

3. Dans l'onglet **"Credentials"**:
   - Vous verrez **"Client Authenticator"**: `Client Id and Secret`
   - En dessous, **"Client secret"**: une longue chaîne comme `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Cliquez sur l'icône de **copie** à côté du secret

4. **Mettez à jour application.properties**:
   - Ouvrez `UserService/src/main/resources/application.properties`
   - Trouvez la ligne:
     ```properties
     keycloak.credentials.secret=0pwSKWbwfSrT1GcmUY81NYnKoPu4sCl0
     ```
   - Remplacez par votre nouveau secret:
     ```properties
     keycloak.credentials.secret=VOTRE_NOUVEAU_SECRET
     ```

---

### ÉTAPE 5: Vérification Finale

#### Dans Keycloak Admin Console:

**Vérifiez le Realm:**
- [ ] Realm "wordly-realm" existe
- [ ] Vous êtes dans ce realm (vérifié en haut à gauche)

**Vérifiez les Rôles:**
- [ ] Menu "Realm roles" → vous voyez ADMIN, TEACHER, STUDENT

**Vérifiez le Client:**
- [ ] Menu "Clients" → "wordly-client" existe
- [ ] Onglet "Settings" → "Client authentication" = ON
- [ ] Onglet "Settings" → "Standard flow" = activé
- [ ] Onglet "Settings" → "Direct access grants" = activé
- [ ] Onglet "Settings" → Valid redirect URIs contient les 3 URLs
- [ ] Onglet "Credentials" → Client secret est visible et copié

---

## Test de la Configuration

### Test 1: Vérifier que Keycloak répond

Ouvrez dans le navigateur:
```
http://localhost:9090/realms/wordly-realm
```

Vous devriez voir un JSON avec les informations du realm.

### Test 2: Vérifier le endpoint OpenID

Ouvrez dans le navigateur:
```
http://localhost:9090/realms/wordly-realm/.well-known/openid-configuration
```

Vous devriez voir un JSON avec tous les endpoints OpenID Connect.

### Test 3: Redémarrer le User Service

1. Arrêtez le User Service dans IntelliJ (bouton stop rouge)
2. Relancez `UserApplication.java`
3. Attendez que le service démarre

### Test 4: Tester la connexion Keycloak

Dans Swagger ou votre navigateur:
```
GET http://localhost:8085/api/auth/test-keycloak
```

**Réponse attendue:**
```json
{
  "status": "Connected to Keycloak",
  "realms_count": 2,
  "realms": ["master", "wordly-realm"]
}
```

### Test 5: Tester l'inscription

Dans Swagger:
```
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

**Réponse attendue:** Status 201 Created avec les données de l'utilisateur

---

## Si l'Erreur Persiste

### Option 1: Vérifier les Logs Keycloak

Dans le terminal où Keycloak tourne, cherchez les erreurs en rouge.

### Option 2: Vérifier les Logs User Service

Dans IntelliJ, regardez la console pour voir les erreurs détaillées.

### Option 3: Créer un Utilisateur Manuellement dans Keycloak

Pour tester si Keycloak fonctionne:

1. Keycloak Admin → Realm "wordly-realm"
2. Menu "Users" → "Add user"
3. Username: `testuser`
4. Email: `test@wordly.com`
5. Email verified: ON
6. Cliquez sur "Create"
7. Onglet "Credentials" → "Set password"
8. Password: `test123`
9. Temporary: OFF
10. Cliquez sur "Save"
11. Onglet "Role mapping" → "Assign role"
12. Sélectionnez "ADMIN"
13. Cliquez sur "Assign"

Si cela fonctionne, le problème vient de la configuration du User Service.

---

## Checklist Complète

Avant de tester l'inscription:

- [ ] Keycloak tourne sur http://localhost:9090
- [ ] Vous pouvez vous connecter à l'admin console (admin/admin)
- [ ] Realm "wordly-realm" existe et est sélectionné
- [ ] 3 rôles existent: ADMIN, TEACHER, STUDENT
- [ ] Client "wordly-client" existe
- [ ] Client authentication = ON
- [ ] Standard flow = activé
- [ ] Direct access grants = activé
- [ ] Valid redirect URIs contient les 3 URLs
- [ ] Client secret est copié dans application.properties
- [ ] MySQL tourne sur port 3307
- [ ] User Service tourne sur port 8085
- [ ] Test endpoint /api/auth/test-keycloak retourne success

---

## Commandes Utiles

### Redémarrer Keycloak:
```powershell
# Arrêter (Ctrl+C dans le terminal)
cd C:\keycloak-23.0.0
bin\kc.bat start-dev --http-port=9090
```

### Vérifier MySQL:
```powershell
# Vérifier si MySQL tourne
netstat -ano | findstr :3307
```

### Vérifier les ports:
```powershell
# Keycloak
netstat -ano | findstr :9090

# User Service
netstat -ano | findstr :8085
```

---

## Contact

Si vous avez toujours des problèmes après avoir suivi ce guide:
1. Copiez les logs d'erreur de Keycloak
2. Copiez les logs d'erreur du User Service
3. Vérifiez que toutes les étapes ont été suivies exactement
