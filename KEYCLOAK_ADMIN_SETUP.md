# Configuration de l'Admin Keycloak

## Erreur 400 Bad Request lors du Login

Cela signifie que l'admin n'est pas encore créé ou que les credentials sont incorrects.

---

## Solution: Créer l'Admin via Variables d'Environnement

### Méthode 1: Arrêter et Redémarrer avec Variables d'Environnement

1. **Arrêter Keycloak** (Ctrl+C dans le terminal)

2. **Définir les variables d'environnement et démarrer:**

```powershell
cd C:\keycloak-23.0.0

# Définir les variables
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"

# Démarrer Keycloak
bin\kc.bat start-dev --http-port=9090
```

3. **Attendez que Keycloak démarre** (environ 30 secondes)

4. **Ouvrez le navigateur:** http://localhost:9090

5. **Connectez-vous:**
   - Username: `admin`
   - Password: `admin`

---

## Méthode 2: Utiliser la Page de Création d'Admin

Si Keycloak vient de démarrer pour la première fois:

1. **Ouvrez:** http://localhost:9090

2. Vous devriez voir une page **"Welcome to Keycloak"** avec un formulaire

3. **Remplissez le formulaire:**
   - Username: `admin`
   - Password: `admin`
   - Confirm password: `admin`

4. **Cliquez sur "Create"**

5. **Cliquez sur "Administration Console"**

6. **Connectez-vous:**
   - Username: `admin`
   - Password: `admin`

---

## Méthode 3: Script PowerShell Complet

Copiez et exécutez ce script dans PowerShell:

```powershell
# Arrêter tous les processus Java (Keycloak)
taskkill /IM java.exe /F 2>$null

# Attendre 2 secondes
Start-Sleep -Seconds 2

# Aller dans le dossier Keycloak
cd C:\keycloak-23.0.0

# Supprimer les anciennes données
Remove-Item -Recurse -Force data -ErrorAction SilentlyContinue

# Définir les variables d'environnement
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"

# Démarrer Keycloak
Write-Host "Démarrage de Keycloak sur le port 9090..."
Write-Host "Admin: admin / admin"
Write-Host "URL: http://localhost:9090"
Write-Host ""
Write-Host "Attendez environ 30 secondes pour que Keycloak démarre..."
Write-Host ""

bin\kc.bat start-dev --http-port=9090
```

---

## Vérification

### 1. Vérifier que Keycloak est démarré

```powershell
netstat -ano | findstr :9090
```

Vous devriez voir:
```
TCP    0.0.0.0:9090    0.0.0.0:0    LISTENING    12345
```

### 2. Vérifier l'URL

Ouvrez dans le navigateur: http://localhost:9090

Vous devriez voir la page d'accueil Keycloak.

### 3. Tester le Login

1. Cliquez sur "Administration Console"
2. Username: `admin`
3. Password: `admin`
4. Cliquez sur "Sign In"

Si ça fonctionne, vous verrez le tableau de bord Keycloak!

---

## Si l'Erreur 400 Persiste

### Option 1: Vérifier les Logs

Dans le terminal PowerShell où Keycloak tourne, cherchez les erreurs.

### Option 2: Supprimer Complètement les Données

```powershell
# Arrêter Keycloak
taskkill /IM java.exe /F

# Supprimer TOUTES les données
cd C:\keycloak-23.0.0
Remove-Item -Recurse -Force data
Remove-Item -Recurse -Force standalone

# Redémarrer
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
bin\kc.bat start-dev --http-port=9090
```

### Option 3: Utiliser un Autre Port

Si le port 9090 pose problème:

```powershell
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
bin\kc.bat start-dev --http-port=8080
```

Puis mettez à jour `application.properties`:
```properties
keycloak.auth-server-url=http://localhost:8080
keycloak.admin.server-url=http://localhost:8080
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/wordly-realm
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://localhost:8080/realms/wordly-realm/protocol/openid-connect/certs
```

---

## Après le Login Réussi

Une fois connecté à l'admin console:

1. ✅ Créer le realm "wordly-realm"
2. ✅ Créer les rôles (ADMIN, TEACHER, STUDENT)
3. ✅ Créer le client "wordly-client"
4. ✅ Activer "Client authentication"
5. ✅ Copier le client secret
6. ✅ Tester l'inscription d'un utilisateur

Suivez le guide: `KEYCLOAK_REALM_SETUP_STEPS.md`

---

## Commandes Rapides

### Arrêter Keycloak:
```powershell
taskkill /IM java.exe /F
```

### Démarrer Keycloak avec Admin:
```powershell
cd C:\keycloak-23.0.0
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
bin\kc.bat start-dev --http-port=9090
```

### Vérifier le port:
```powershell
netstat -ano | findstr :9090
```

### Fresh start complet:
```powershell
taskkill /IM java.exe /F
cd C:\keycloak-23.0.0
Remove-Item -Recurse -Force data
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"
bin\kc.bat start-dev --http-port=9090
```
