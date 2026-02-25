# Solution de Contournement - Keycloak Admin Console Cassée

## Problème

L'interface admin de Keycloak a des erreurs réseau et ne fonctionne pas correctement.

---

## Solution 1: Utiliser l'API REST Keycloak (Recommandé)

Nous allons créer le realm et les rôles via l'API REST au lieu de l'interface web.

### Étape 1: Obtenir un Token Admin

**Dans Postman ou un terminal PowerShell:**

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:9090/realms/master/protocol/openid-connect/token" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "grant_type=password&client_id=admin-cli&username=admin&password=admin"

$token = $response.access_token
Write-Host "Token: $token"
```

**Copiez le token!**

---

### Étape 2: Créer le Realm "wordly-realm"

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    realm = "wordly-realm"
    enabled = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

**Résultat:** Le realm est créé!

---

### Étape 3: Créer les Rôles

**Créer le rôle ADMIN:**
```powershell
$body = @{
    name = "ADMIN"
    description = "Administrator role"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/roles" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

**Créer le rôle TEACHER:**
```powershell
$body = @{
    name = "TEACHER"
    description = "Teacher role"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/roles" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

**Créer le rôle STUDENT:**
```powershell
$body = @{
    name = "STUDENT"
    description = "Student role"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/roles" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

---

### Étape 4: Créer le Client "wordly-client"

```powershell
$body = @{
    clientId = "wordly-client"
    enabled = $true
    publicClient = $false
    directAccessGrantsEnabled = $true
    standardFlowEnabled = $true
    redirectUris = @(
        "http://localhost:4200/*",
        "http://localhost:4201/*",
        "http://localhost:8085/*"
    )
    webOrigins = @("*")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/clients" `
  -Method POST `
  -Headers $headers `
  -Body $body
```

---

### Étape 5: Récupérer le Client Secret

```powershell
# Obtenir l'ID du client
$clients = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/clients" `
  -Method GET `
  -Headers $headers

$clientId = ($clients | Where-Object { $_.clientId -eq "wordly-client" }).id

# Obtenir le secret
$secret = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/clients/$clientId/client-secret" `
  -Method GET `
  -Headers $headers

Write-Host "Client Secret: $($secret.value)"
```

**Copiez le secret et mettez-le dans `application.properties`!**

---

## Solution 2: Script PowerShell Complet

Copiez et exécutez ce script complet:

```powershell
# Configuration Keycloak via API REST

Write-Host "=== Configuration Keycloak ===" -ForegroundColor Cyan
Write-Host ""

# 1. Obtenir le token admin
Write-Host "1. Obtention du token admin..." -ForegroundColor Yellow
$tokenResponse = Invoke-RestMethod -Uri "http://localhost:9090/realms/master/protocol/openid-connect/token" `
  -Method POST `
  -ContentType "application/x-www-form-urlencoded" `
  -Body "grant_type=password&client_id=admin-cli&username=admin&password=admin"

$token = $tokenResponse.access_token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
Write-Host "   Token obtenu!" -ForegroundColor Green

# 2. Créer le realm
Write-Host "2. Création du realm 'wordly-realm'..." -ForegroundColor Yellow
try {
    $realmBody = @{
        realm = "wordly-realm"
        enabled = $true
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:9090/admin/realms" `
      -Method POST `
      -Headers $headers `
      -Body $realmBody
    Write-Host "   Realm créé!" -ForegroundColor Green
} catch {
    Write-Host "   Realm existe déjà ou erreur: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Créer les rôles
Write-Host "3. Création des rôles..." -ForegroundColor Yellow

$roles = @("ADMIN", "TEACHER", "STUDENT")
foreach ($roleName in $roles) {
    try {
        $roleBody = @{
            name = $roleName
            description = "$roleName role"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/roles" `
          -Method POST `
          -Headers $headers `
          -Body $roleBody
        Write-Host "   Rôle $roleName créé!" -ForegroundColor Green
    } catch {
        Write-Host "   Rôle $roleName existe déjà ou erreur" -ForegroundColor Yellow
    }
}

# 4. Créer le client
Write-Host "4. Création du client 'wordly-client'..." -ForegroundColor Yellow
try {
    $clientBody = @{
        clientId = "wordly-client"
        enabled = $true
        publicClient = $false
        directAccessGrantsEnabled = $true
        standardFlowEnabled = $true
        redirectUris = @(
            "http://localhost:4200/*",
            "http://localhost:4201/*",
            "http://localhost:8085/*"
        )
        webOrigins = @("*")
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/clients" `
      -Method POST `
      -Headers $headers `
      -Body $clientBody
    Write-Host "   Client créé!" -ForegroundColor Green
} catch {
    Write-Host "   Client existe déjà ou erreur: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 5. Récupérer le client secret
Write-Host "5. Récupération du client secret..." -ForegroundColor Yellow
$clients = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/clients" `
  -Method GET `
  -Headers $headers

$client = $clients | Where-Object { $_.clientId -eq "wordly-client" }
$clientId = $client.id

$secret = Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/clients/$clientId/client-secret" `
  -Method GET `
  -Headers $headers

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration terminée!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Client Secret: $($secret.value)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copiez ce secret dans application.properties:" -ForegroundColor Yellow
Write-Host "keycloak.credentials.secret=$($secret.value)" -ForegroundColor White
Write-Host ""
Write-Host "Puis redémarrez le User Service!" -ForegroundColor Yellow
```

**Sauvegardez ce script dans `setup-keycloak.ps1` et exécutez-le!**

---

## Solution 3: Utiliser Docker (Plus Stable)

Si Keycloak continue à avoir des problèmes, utilisez Docker:

```powershell
# Arrêter Keycloak actuel
taskkill /IM java.exe /F

# Démarrer avec Docker
docker run -d --name keycloak `
  -p 9090:8080 `
  -e KEYCLOAK_ADMIN=admin `
  -e KEYCLOAK_ADMIN_PASSWORD=admin `
  quay.io/keycloak/keycloak:23.0.0 start-dev
```

Puis utilisez le script PowerShell ci-dessus pour configurer.

---

## Vérification

Après avoir exécuté le script, vérifiez:

```powershell
# Vérifier le realm
Invoke-RestMethod -Uri "http://localhost:9090/realms/wordly-realm" -Method GET

# Vérifier les rôles
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/roles" `
  -Method GET `
  -Headers $headers
```

---

## Test Final

Une fois configuré:

1. **Mettez à jour le client secret** dans `application.properties`
2. **Redémarrez le User Service**
3. **Testez la connexion:**
   ```
   http://localhost:8085/api/auth/test-keycloak
   ```
4. **Testez l'inscription:**
   ```
   POST http://localhost:8085/api/auth/register
   ```

---

## Avantages de cette Méthode

- ✅ Pas besoin de l'interface web cassée
- ✅ Plus rapide
- ✅ Scriptable et reproductible
- ✅ Fonctionne même si l'admin console a des bugs

---

## En Cas d'Erreur

### "Unauthorized"
- Le token a expiré, obtenez-en un nouveau
- Vérifiez username/password admin

### "Conflict" ou "Already exists"
- L'élément existe déjà, c'est OK!
- Continuez avec les autres étapes

### "Connection refused"
- Keycloak n'est pas démarré
- Vérifiez: http://localhost:9090

---

**Utilisez le script PowerShell complet, c'est la solution la plus simple!**
