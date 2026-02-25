# Démarrer Keycloak - Guide Rapide

## 🎯 Problème
User Service ne peut pas se connecter à Keycloak (port 9090)

## 🚀 Solution: Démarrer Keycloak

### Méthode 1: Via PowerShell (Recommandé)

```powershell
# Ouvrir PowerShell en tant qu'administrateur
cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0\bin

# Définir les variables d'environnement
$env:KEYCLOAK_ADMIN="admin"
$env:KEYCLOAK_ADMIN_PASSWORD="admin"

# Démarrer Keycloak
.\kc.bat start-dev --http-port=9090
```

### Méthode 2: Via CMD

```cmd
cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0\bin

set KEYCLOAK_ADMIN=admin
set KEYCLOAK_ADMIN_PASSWORD=admin

kc.bat start-dev --http-port=9090
```

## ⏱️ Temps de Démarrage

- **Première fois**: 2-3 minutes
- **Fois suivantes**: 30-60 secondes

## ✅ Vérification

### 1. Attendre le message
```
Listening on: http://0.0.0.0:9090
```

### 2. Ouvrir le navigateur
```
http://localhost:9090
```

### 3. Se connecter
```
Username: admin
Password: admin
```

### 4. Vérifier le realm
```
1. Cliquer sur le menu déroulant en haut à gauche
2. Vérifier que "wordly-realm" existe
3. Si non, voir KEYCLOAK_REALM_SETUP_STEPS.md
```

## 🔍 Vérifier que Keycloak Tourne

```powershell
# Vérifier le port 9090
netstat -ano | findstr :9090
```

Si rien ne s'affiche, Keycloak n'est pas démarré.

## 🐛 Si Keycloak Ne Démarre Pas

### Problème 1: Port 9090 déjà utilisé
```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :9090

# Tuer le processus (remplacer PID par le numéro)
taskkill /PID <PID> /F
```

### Problème 2: Fichiers verrouillés
```powershell
# Supprimer le dossier data
cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0
Remove-Item -Recurse -Force data

# Redémarrer Keycloak
cd bin
.\kc.bat start-dev --http-port=9090
```

### Problème 3: Processus Java bloqué
```powershell
# Tuer tous les processus Java
taskkill /F /IM java.exe

# Redémarrer Keycloak
cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0\bin
.\kc.bat start-dev --http-port=9090
```

## 📝 Après le Démarrage

### Tester la connexion depuis User Service

```powershell
# Via Swagger
http://localhost:8085/swagger-ui.html

# Endpoint: GET /api/auth/test-keycloak
# Devrait retourner: Status 200 OK
```

### Créer un utilisateur

```powershell
# Via Swagger: POST /api/auth/register
# Utiliser les exemples de QUICK_TEST_COMMANDS.md
```

## 🎯 Checklist

- [ ] Keycloak démarré sur port 9090
- [ ] Accessible via http://localhost:9090
- [ ] Login admin/admin fonctionne
- [ ] Realm "wordly-realm" existe
- [ ] User Service peut se connecter
- [ ] Test /api/auth/test-keycloak réussit

## 📚 Documentation

- **KEYCLOAK_REALM_SETUP_STEPS.md** - Configurer le realm
- **KEYCLOAK_TROUBLESHOOTING.md** - Dépannage
- **USER_SERVICE_TEST_GUIDE.md** - Tests User Service
- **QUICK_TEST_COMMANDS.md** - Exemples de requêtes

## ⚠️ Note Importante

Si vous ne voulez PAS utiliser User Service pour l'instant:
- Vous pouvez laisser Keycloak éteint
- Abonnement Service fonctionne sans Keycloak
- Frontend et Back-Office fonctionnent sans Keycloak
- User Service est optionnel pour les tests
