# Script Automatique - Configuration Complete de Keycloak

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURATION AUTOMATIQUE KEYCLOAK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$keycloakUrl = "http://localhost:9090"
$adminUser = "admin"
$adminPassword = "admin"
$realmName = "wordly-realm"
$clientId = "wordly-client"
$clientSecret = "IKCT56zE5uPce6lzAPBcAVAWfYcDfdOn"

# Fonction pour obtenir le token admin
function Get-AdminToken {
    Write-Host "Connexion a Keycloak..." -ForegroundColor Yellow
    
    $body = @{
        username = $adminUser
        password = $adminPassword
        grant_type = "password"
        client_id = "admin-cli"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -Body $body -ContentType "application/x-www-form-urlencoded"
        Write-Host "OK - Token obtenu" -ForegroundColor Green
        return $response.access_token
    } catch {
        Write-Host "ERREUR - Impossible de se connecter a Keycloak" -ForegroundColor Red
        Write-Host "Verifiez que Keycloak est demarre sur $keycloakUrl" -ForegroundColor Yellow
        exit 1
    }
}

# Fonction pour creer le realm
function Create-Realm {
    param($token)
    
    Write-Host "Creation du realm '$realmName'..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $realmData = @{
        realm = $realmName
        enabled = $true
        displayName = "Wordly Realm"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$keycloakUrl/admin/realms" -Method POST -Headers $headers -Body $realmData
        Write-Host "OK - Realm cree" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "INFO - Realm existe deja" -ForegroundColor Gray
        } else {
            Write-Host "ERREUR - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Fonction pour creer un role
function Create-Role {
    param($token, $roleName)
    
    Write-Host "Creation du role '$roleName'..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $roleData = @{
        name = $roleName
        description = "$roleName role"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realmName/roles" -Method POST -Headers $headers -Body $roleData
        Write-Host "OK - Role '$roleName' cree" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "INFO - Role '$roleName' existe deja" -ForegroundColor Gray
        } else {
            Write-Host "ERREUR - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Fonction pour creer le client
function Create-Client {
    param($token)
    
    Write-Host "Creation du client '$clientId'..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $clientData = @{
        clientId = $clientId
        enabled = $true
        publicClient = $false
        directAccessGrantsEnabled = $true
        serviceAccountsEnabled = $true
        standardFlowEnabled = $true
        implicitFlowEnabled = $false
        redirectUris = @("http://localhost:*", "http://localhost:4200/*", "http://localhost:4201/*")
        webOrigins = @("*")
        attributes = @{
            "access.token.lifespan" = "3600"
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realmName/clients" -Method POST -Headers $headers -Body $clientData
        Write-Host "OK - Client cree avec secret: $clientSecret" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "INFO - Client existe deja" -ForegroundColor Gray
            Write-Host "Mise a jour du client..." -ForegroundColor Yellow
            
            # Obtenir l'ID du client
            $clients = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realmName/clients?clientId=$clientId" -Method GET -Headers $headers
            if ($clients.Count -gt 0) {
                $clientUuid = $clients[0].id
                
                # Mettre a jour le secret
                $secretData = @{
                    type = "secret"
                    value = $clientSecret
                } | ConvertTo-Json
                
                try {
                    Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realmName/clients/$clientUuid" -Method PUT -Headers $headers -Body $clientData
                    Write-Host "OK - Client mis a jour" -ForegroundColor Green
                } catch {
                    Write-Host "ERREUR - Impossible de mettre a jour le client" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "ERREUR - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Fonction pour creer l'utilisateur ADMIN
function Create-AdminUser {
    Write-Host "Creation de l'utilisateur ADMIN..." -ForegroundColor Yellow
    
    $body = @{
        username = "admin"
        email = "admin@wordly.com"
        password = "Admin123!"
        role = "ADMIN"
        nom = "Administrator"
        prenom = "System"
        telephone = "00000000"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" -Method POST -ContentType "application/json" -Body $body
        Write-Host "OK - Utilisateur ADMIN cree" -ForegroundColor Green
        return $true
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "INFO - Utilisateur existe deja" -ForegroundColor Gray
            return $true
        } elseif ($_.Exception.Response.StatusCode.value__ -eq 500) {
            Write-Host "ERREUR - Le role ADMIN n'existe pas encore dans Keycloak" -ForegroundColor Red
            return $false
        } else {
            Write-Host "ERREUR - $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Fonction pour assigner le role ADMIN
function Assign-AdminRole {
    param($token)
    
    Write-Host "Attribution du role ADMIN..." -ForegroundColor Yellow
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        # Chercher l'utilisateur
        $users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realmName/users?username=admin&exact=true" -Method GET -Headers $headers
        
        if ($users.Count -eq 0) {
            Write-Host "ERREUR - Utilisateur 'admin' introuvable" -ForegroundColor Red
            return
        }
        
        $userId = $users[0].id
        
        # Obtenir le role ADMIN
        $role = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realmName/roles/ADMIN" -Method GET -Headers $headers
        
        # Assigner le role
        $roleData = @(@{
            id = $role.id
            name = $role.name
        }) | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realmName/users/$userId/role-mappings/realm" -Method POST -Headers $headers -Body $roleData
        Write-Host "OK - Role ADMIN assigne" -ForegroundColor Green
    } catch {
        Write-Host "ERREUR - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Vous devrez assigner le role manuellement dans Keycloak" -ForegroundColor Yellow
    }
}

# EXECUTION PRINCIPALE
Write-Host "Verification de Keycloak..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$keycloakUrl/realms/master" -Method GET -TimeoutSec 5 | Out-Null
    Write-Host "OK - Keycloak accessible" -ForegroundColor Green
} catch {
    Write-Host "ERREUR - Keycloak n'est pas accessible sur $keycloakUrl" -ForegroundColor Red
    Write-Host "Demarrez Keycloak avec: bin\kc.bat start-dev --http-port=9090" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Obtenir le token admin
$token = Get-AdminToken

Write-Host ""

# Creer le realm
Create-Realm -token $token

Write-Host ""

# Creer les roles
Create-Role -token $token -roleName "TEACHER"
Create-Role -token $token -roleName "STUDENT"
Create-Role -token $token -roleName "ADMIN"

Write-Host ""

# Creer le client
Create-Client -token $token

Write-Host ""

# Creer l'utilisateur ADMIN
$userCreated = Create-AdminUser

Write-Host ""

# Assigner le role ADMIN
if ($userCreated) {
    Start-Sleep -Seconds 2
    Assign-AdminRole -token $token
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CONFIGURATION TERMINEE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "RESUME:" -ForegroundColor Cyan
Write-Host "  Realm: $realmName" -ForegroundColor Gray
Write-Host "  Roles: TEACHER, STUDENT, ADMIN" -ForegroundColor Gray
Write-Host "  Client: $clientId" -ForegroundColor Gray
Write-Host "  Client Secret: $clientSecret" -ForegroundColor Gray
Write-Host "  Utilisateur ADMIN: admin@wordly.com / Admin123!" -ForegroundColor Gray
Write-Host ""
Write-Host "TESTER LA CONNEXION:" -ForegroundColor Yellow
Write-Host "1. Ouvrir: http://localhost:4200" -ForegroundColor Gray
Write-Host "2. Sign In avec: admin@wordly.com / Admin123!" -ForegroundColor Gray
Write-Host "3. Vous serez redirige vers: http://localhost:4201/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
