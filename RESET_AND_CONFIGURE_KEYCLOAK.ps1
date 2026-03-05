# Script pour réinitialiser et configurer Keycloak automatiquement
# Exécuter ce script en tant qu'administrateur

Write-Host "=== Réinitialisation et Configuration de Keycloak ===" -ForegroundColor Cyan

# Étape 1: Arrêter Keycloak si il tourne
Write-Host "`n[1/6] Vérification si Keycloak est en cours d'exécution..." -ForegroundColor Yellow
$keycloakProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*keycloak*" }
if ($keycloakProcess) {
    Write-Host "Arrêt de Keycloak..." -ForegroundColor Yellow
    Stop-Process -Id $keycloakProcess.Id -Force
    Start-Sleep -Seconds 3
    Write-Host "✓ Keycloak arrêté" -ForegroundColor Green
} else {
    Write-Host "✓ Keycloak n'est pas en cours d'exécution" -ForegroundColor Green
}

# Étape 2: Supprimer le dossier data
Write-Host "`n[2/6] Suppression du dossier data corrompu..." -ForegroundColor Yellow
$dataPath = "C:\keycloak-23.0.0\data"
if (Test-Path $dataPath) {
    Remove-Item -Recurse -Force $dataPath
    Write-Host "✓ Dossier data supprimé" -ForegroundColor Green
} else {
    Write-Host "✓ Dossier data n'existe pas" -ForegroundColor Green
}

# Étape 3: Démarrer Keycloak en arrière-plan
Write-Host "`n[3/6] Démarrage de Keycloak..." -ForegroundColor Yellow
Write-Host "Cela peut prendre 30-60 secondes..." -ForegroundColor Gray

$keycloakPath = "C:\keycloak-23.0.0"
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "cmd.exe"
$startInfo.Arguments = "/c cd $keycloakPath && bin\kc.bat start-dev --http-port=9090"
$startInfo.UseShellExecute = $true
$startInfo.WindowStyle = "Minimized"

$process = [System.Diagnostics.Process]::Start($startInfo)

Write-Host "Attente du démarrage de Keycloak (60 secondes)..." -ForegroundColor Gray
Start-Sleep -Seconds 60

# Vérifier si Keycloak est accessible
$maxRetries = 10
$retryCount = 0
$keycloakReady = $false

while ($retryCount -lt $maxRetries -and -not $keycloakReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        $keycloakReady = $true
        Write-Host "✓ Keycloak est démarré et accessible" -ForegroundColor Green
    } catch {
        $retryCount++
        Write-Host "Tentative $retryCount/$maxRetries..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
}

if (-not $keycloakReady) {
    Write-Host "✗ Keycloak n'est pas accessible après $maxRetries tentatives" -ForegroundColor Red
    Write-Host "Veuillez démarrer Keycloak manuellement et réexécuter ce script" -ForegroundColor Yellow
    exit 1
}

# Étape 4: Obtenir le token d'accès admin
Write-Host "`n[4/6] Connexion à Keycloak Admin..." -ForegroundColor Yellow

$tokenUrl = "http://localhost:9090/realms/master/protocol/openid-connect/token"
$tokenBody = @{
    username = "admin"
    password = "admin"
    grant_type = "password"
    client_id = "admin-cli"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $accessToken = $tokenResponse.access_token
    Write-Host "✓ Token d'accès obtenu" -ForegroundColor Green
} catch {
    Write-Host "✗ Erreur lors de l'obtention du token: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Veuillez configurer Keycloak manuellement" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

# Étape 5: Créer le realm wordly-realm
Write-Host "`n[5/6] Configuration du realm 'wordly-realm'..." -ForegroundColor Yellow

$realmData = @{
    realm = "wordly-realm"
    enabled = $true
    displayName = "Wordly Realm"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:9090/admin/realms" -Method POST -Headers $headers -Body $realmData
    Write-Host "✓ Realm 'wordly-realm' créé" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✓ Realm 'wordly-realm' existe déjà" -ForegroundColor Green
    } else {
        Write-Host "✗ Erreur lors de la création du realm: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Créer les rôles
Write-Host "Création des rôles..." -ForegroundColor Gray

$roles = @("TEACHER", "STUDENT", "ADMIN")
foreach ($role in $roles) {
    $roleData = @{
        name = $role
        description = "$role role"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/roles" -Method POST -Headers $headers -Body $roleData
        Write-Host "  ✓ Rôle '$role' créé" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "  ✓ Rôle '$role' existe déjà" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Erreur lors de la création du rôle '$role'" -ForegroundColor Red
        }
    }
}

# Créer le client wordly-client
Write-Host "Création du client 'wordly-client'..." -ForegroundColor Gray

$clientData = @{
    clientId = "wordly-client"
    enabled = $true
    publicClient = $false
    directAccessGrantsEnabled = $true
    serviceAccountsEnabled = $true
    secret = "nn9A67Ft98deqnIWKZjpu0u61desPIjW"
    redirectUris = @("http://localhost:4200/*", "http://localhost:4201/*")
    webOrigins = @("http://localhost:4200", "http://localhost:4201")
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:9090/admin/realms/wordly-realm/clients" -Method POST -Headers $headers -Body $clientData
    Write-Host "  ✓ Client 'wordly-client' créé" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "  ✓ Client 'wordly-client' existe déjà" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erreur lors de la création du client: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Étape 6: Créer l'utilisateur ADMIN
Write-Host "`n[6/6] Création de l'utilisateur ADMIN..." -ForegroundColor Yellow

# Attendre un peu pour que tout soit bien configuré
Start-Sleep -Seconds 5

# Créer l'utilisateur via l'API de votre application
$adminUserData = @{
    username = "admin"
    email = "admin@test.com"
    password = "Admin123!"
    role = "ADMIN"
    nom = "Admin"
    prenom = "System"
    telephone = "00000000"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" -Method POST -ContentType "application/json" -Body $adminUserData
    Write-Host "✓ Utilisateur ADMIN créé dans la base de données" -ForegroundColor Green
} catch {
    Write-Host "⚠ Erreur lors de la création de l'utilisateur ADMIN: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Vous pouvez créer l'utilisateur manuellement plus tard" -ForegroundColor Gray
}

# Résumé
Write-Host "`n=== Configuration Terminée ===" -ForegroundColor Cyan
Write-Host "`nKeycloak est configuré avec:" -ForegroundColor White
Write-Host "  • Realm: wordly-realm" -ForegroundColor Gray
Write-Host "  • Client: wordly-client" -ForegroundColor Gray
Write-Host "  • Client Secret: nn9A67Ft98deqnIWKZjpu0u61desPIjW" -ForegroundColor Gray
Write-Host "  • Rôles: TEACHER, STUDENT, ADMIN" -ForegroundColor Gray
Write-Host "  • Utilisateur ADMIN: admin@test.com / Admin123!" -ForegroundColor Gray

Write-Host "`nAccès Keycloak Admin:" -ForegroundColor White
Write-Host "  URL: http://localhost:9090/admin" -ForegroundColor Gray
Write-Host "  Login: admin / admin" -ForegroundColor Gray

Write-Host "`nPour tester:" -ForegroundColor White
Write-Host "  1. Aller sur http://localhost:4200" -ForegroundColor Gray
Write-Host "  2. Cliquer sur 'Sign In'" -ForegroundColor Gray
Write-Host "  3. Se connecter avec: admin@test.com / Admin123!" -ForegroundColor Gray
Write-Host "  4. Vous serez redirigé vers le back-office (http://localhost:4201/dashboard)" -ForegroundColor Gray

Write-Host "`nNote: Si l'utilisateur ADMIN n'a pas été créé, vous devez:" -ForegroundColor Yellow
Write-Host "  1. Vérifier que le User Service est en cours d'exécution (port 8085)" -ForegroundColor Gray
Write-Host "  2. Réexécuter la commande de création d'utilisateur manuellement" -ForegroundColor Gray

Write-Host "`nAppuyez sur une touche pour fermer..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
