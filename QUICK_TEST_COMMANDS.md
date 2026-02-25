# Commandes Rapides de Test - User Service

## 1. Nettoyer les Utilisateurs de Test (si conflit)

```powershell
.\CLEANUP_TEST_USERS.ps1
```

## 2. Créer des Utilisateurs via Swagger

Ouvrir: http://localhost:8085/swagger-ui.html

### Admin
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

### Teacher
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

### Student
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

## 3. Obtenir un Token JWT

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
Write-Host "Access Token: $token"
```

## 4. Tester avec le Token

```powershell
# Récupérer les infos de l'utilisateur connecté
Invoke-RestMethod -Uri "http://localhost:8085/api/auth/me" `
  -Method Get `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

## 5. Vérifier dans MySQL

```sql
USE user_db;
SELECT id_user, username, email, role, enabled, nom, prenom FROM users;
```

## 6. Vérifier dans Keycloak

1. Ouvrir: http://localhost:9090
2. Login: admin / admin
3. Realm: wordly-realm
4. Menu: Users

## Points Importants

- ✅ Toujours utiliser des username et email UNIQUES
- ✅ Ne JAMAIS utiliser "string" comme valeur
- ✅ Le password est géré par Keycloak (non stocké dans MySQL)
- ✅ MySQL stocke TOUS les attributs utilisateur
- ✅ Keycloak stocke UNIQUEMENT: username, email, password, role
