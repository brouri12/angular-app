# Guide: Créer un Utilisateur ADMIN

## Étape 1: Créer le rôle ADMIN dans Keycloak

1. **Ouvrir Keycloak Admin Console**
   - Aller sur: http://localhost:9090/admin
   - Login: admin / admin

2. **Sélectionner le realm**
   - Cliquer sur le menu déroulant en haut à gauche
   - Sélectionner "wordly-realm"

3. **Créer le rôle ADMIN**
   - Dans le menu de gauche, cliquer sur "Realm roles"
   - Cliquer sur "Create role"
   - Role name: `ADMIN`
   - Description: `Administrator role`
   - Cliquer sur "Save"

## Étape 2: Créer un utilisateur ADMIN via l'API

### Option A: Via Postman ou curl

```bash
# Créer un utilisateur ADMIN
curl -X POST http://localhost:8888/user-service/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "Admin123!",
    "role": "ADMIN",
    "nom": "Admin",
    "prenom": "System",
    "telephone": "00000000"
  }'
```

### Option B: Via PowerShell

```powershell
$body = @{
    username = "admin"
    email = "admin@test.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Admin"
    prenom = "System"
    telephone = "00000000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Option C: Via le formulaire d'inscription (si vous ajoutez ADMIN au formulaire)

Actuellement, le formulaire d'inscription ne permet que TEACHER et STUDENT. Pour ajouter ADMIN:

1. Ouvrir `frontend/angular-app/src/app/components/auth-modal/auth-modal.html`
2. Trouver la section du select de rôle
3. Ajouter l'option ADMIN (temporairement pour créer l'admin)

## Étape 3: Assigner le rôle ADMIN dans Keycloak

Après avoir créé l'utilisateur via l'API:

1. **Aller dans Keycloak Admin Console**
   - http://localhost:9090/admin
   - Sélectionner "wordly-realm"

2. **Trouver l'utilisateur**
   - Menu gauche: "Users"
   - Cliquer sur "View all users"
   - Trouver l'utilisateur "admin"
   - Cliquer dessus

3. **Assigner le rôle ADMIN**
   - Aller dans l'onglet "Role mapping"
   - Cliquer sur "Assign role"
   - Chercher "ADMIN" dans la liste
   - Cocher la case à côté de "ADMIN"
   - Cliquer sur "Assign"

4. **Vérifier les rôles**
   - L'utilisateur devrait maintenant avoir le rôle "ADMIN" assigné
   - Vous pouvez aussi voir les autres rôles par défaut

## Étape 4: Tester la connexion ADMIN

1. **Aller sur le frontend**: http://localhost:4200
2. **Cliquer sur "Sign In"**
3. **Entrer les identifiants**:
   - Email: `admin@test.com`
   - Password: `Admin123!`
4. **Cliquer sur "Sign in to your account"**
5. **Vérifier la redirection**:
   - Vous devriez être automatiquement redirigé vers: http://localhost:4201/dashboard
   - Le back-office devrait s'afficher

## Étape 5: Tester avec TEACHER/STUDENT

1. **Créer un utilisateur TEACHER ou STUDENT** (via le formulaire d'inscription)
2. **Se connecter avec cet utilisateur**
3. **Vérifier la redirection**:
   - Devrait rester sur http://localhost:4200
   - Le menu utilisateur devrait apparaître

## Vérification rapide

### Vérifier dans MySQL que l'utilisateur existe:

```sql
USE user_db;
SELECT id_user, username, email, role FROM users WHERE email = 'admin@test.com';
```

### Vérifier dans Keycloak:

1. Admin Console → Users → View all users
2. Chercher "admin"
3. Vérifier que le rôle ADMIN est assigné dans "Role mapping"

## Dépannage

### Problème: L'utilisateur ADMIN est créé mais la redirection ne fonctionne pas

**Solution**: Vérifier que le rôle ADMIN est bien assigné dans Keycloak (Étape 3)

### Problème: Erreur lors de la création de l'utilisateur

**Solution**: 
- Vérifier que le User Service est en cours d'exécution (port 8085)
- Vérifier que Keycloak est accessible (port 9090)
- Vérifier que le rôle ADMIN existe dans Keycloak

### Problème: Le rôle ADMIN n'apparaît pas dans Keycloak

**Solution**: Créer le rôle manuellement (Étape 1)

## Commande rapide pour tout faire

```powershell
# 1. Créer l'utilisateur ADMIN via API
$body = @{
    username = "admin"
    email = "admin@test.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Admin"
    prenom = "System"
    telephone = "00000000"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "✓ Utilisateur ADMIN créé!"
Write-Host "⚠ N'oubliez pas d'assigner le rôle ADMIN dans Keycloak!"
Write-Host "   1. Aller sur http://localhost:9090/admin"
Write-Host "   2. Users → admin → Role mapping → Assign role → ADMIN"
```

## Résumé

1. ✅ Créer le rôle ADMIN dans Keycloak
2. ✅ Créer l'utilisateur ADMIN via l'API
3. ✅ Assigner le rôle ADMIN à l'utilisateur dans Keycloak
4. ✅ Tester la connexion et la redirection

Après ces étapes, vous aurez un utilisateur ADMIN fonctionnel qui sera redirigé vers le back-office lors de la connexion!
