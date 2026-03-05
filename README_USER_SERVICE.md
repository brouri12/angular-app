# User Service - Guide Rapide

## 🎯 Résumé des Corrections

Toutes les erreurs de registration ont été corrigées:
- ✅ Erreur "Password is required" 
- ✅ Erreur "Conflict" avec messages clairs
- ✅ Messages d'erreur améliorés

## 📁 Fichiers Importants

### Documentation
- `FIXES_APPLIED.md` - Détails de toutes les corrections
- `USER_SERVICE_TEST_GUIDE.md` - Guide complet de test
- `QUICK_TEST_COMMANDS.md` - Commandes rapides
- `CURRENT_STATUS.md` - État du projet

### Scripts
- `CLEANUP_TEST_USERS.ps1` - Nettoyer les utilisateurs de test Keycloak

## 🚀 Démarrage Rapide

### 1. Démarrer les Services

```powershell
# MySQL (port 3307) - via XAMPP/WAMP ou service Windows

# Keycloak (port 9090)
cd C:\Users\marwe\Downloads\keycloak-23.0.0\keycloak-23.0.0\bin
.\kc.bat start-dev --http-port=9090

# User Service (port 8085) - dans IntelliJ
# Lancer UserApplication.java
```

### 2. Nettoyer les Utilisateurs de Test (si nécessaire)

```powershell
.\CLEANUP_TEST_USERS.ps1
```

### 3. Tester l'Inscription

Ouvrir Swagger: http://localhost:8085/swagger-ui.html

Endpoint: `POST /api/auth/register`

**Exemple Admin**:
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

**Exemple Teacher**:
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

**Exemple Student**:
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

### 4. Obtenir un Token JWT

```powershell
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

### 5. Utiliser le Token

```powershell
Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" `
  -Method Get `
  -Headers @{"Authorization" = "Bearer $token"}
```

## 🔍 Vérifications

### MySQL
```sql
USE user_db;
SELECT id_user, username, email, role, enabled, nom, prenom FROM users;
```

### Keycloak
1. Ouvrir: http://localhost:9090
2. Login: admin / admin
3. Realm: wordly-realm
4. Menu: Users

## ⚠️ Points Importants

- ✅ Toujours utiliser des username et email UNIQUES
- ✅ Ne JAMAIS utiliser "string" comme valeur
- ✅ Le password est géré par Keycloak (non stocké dans MySQL)
- ✅ MySQL stocke TOUS les attributs utilisateur
- ✅ Keycloak stocke UNIQUEMENT: username, email, password, role

## 🐛 Résolution de Problèmes

### Erreur "User already exists"
```powershell
.\CLEANUP_TEST_USERS.ps1
```

### Erreur "Failed to connect to Keycloak"
- Vérifier que Keycloak tourne sur port 9090
- Vérifier que le realm "wordly-realm" existe
- Vérifier les credentials dans application.properties

### Erreur "Communications link failure"
- Démarrer MySQL sur port 3307

## 📚 Documentation Complète

Pour plus de détails, consultez:
- `USER_SERVICE_TEST_GUIDE.md` - Guide détaillé avec explications
- `FIXES_APPLIED.md` - Détails techniques des corrections
- `QUICK_TEST_COMMANDS.md` - Toutes les commandes en un coup d'œil

## ✅ Checklist de Test

- [ ] MySQL démarré sur port 3307
- [ ] Keycloak démarré sur port 9090
- [ ] User Service démarré sur port 8085
- [ ] Realm "wordly-realm" configuré dans Keycloak
- [ ] Utilisateurs de test nettoyés (si nécessaire)
- [ ] Inscription d'un ADMIN testée
- [ ] Inscription d'un TEACHER testée
- [ ] Inscription d'un STUDENT testée
- [ ] Obtention de token JWT testée
- [ ] Accès à endpoint protégé testé
- [ ] Vérification MySQL effectuée
- [ ] Vérification Keycloak effectuée

## 🎉 Prochaines Étapes

Une fois tous les tests passés:
1. Intégrer avec le frontend Angular (port 4200)
2. Intégrer avec le back-office (port 4201)
3. Ajouter les pages de login/register
4. Gérer les tokens JWT dans les services Angular
5. Protéger les routes Angular avec guards
