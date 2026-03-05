# Complete Keycloak reset and reconfiguration

Write-Host "=== Complete Keycloak Reset ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will:" -ForegroundColor Yellow
Write-Host "1. Stop Keycloak (if running)"
Write-Host "2. Delete all Keycloak data"
Write-Host "3. Reconfigure Keycloak"
Write-Host "4. Create realm, client, and roles"
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cancelled" -ForegroundColor Red
    exit
}
Write-Host ""

# Step 1: Stop Keycloak
Write-Host "Step 1: Stopping Keycloak..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*java*" -and $_.CommandLine -like "*keycloak*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Done" -ForegroundColor Green
Write-Host ""

# Step 2: Delete data
Write-Host "Step 2: Deleting old data..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\data") {
    Remove-Item -Path "C:\keycloak-23.0.0\data" -Recurse -Force
    Write-Host "Data deleted" -ForegroundColor Green
} else {
    Write-Host "No data found" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Configure for H2
Write-Host "Step 3: Configuring Keycloak..." -ForegroundColor Yellow
$config = @"
# H2 Database (default)
hostname-strict=false
hostname-strict-https=false
http-enabled=true
http-port=9090
"@
$config | Out-File -FilePath "C:\keycloak-23.0.0\conf\keycloak.conf" -Encoding UTF8 -Force
Write-Host "Configuration created" -ForegroundColor Green
Write-Host ""

# Step 4: Start Keycloak
Write-Host "Step 4: Starting Keycloak..." -ForegroundColor Yellow
Write-Host "This will take 30-60 seconds..." -ForegroundColor Cyan
Write-Host ""
Start-Process -FilePath "C:\keycloak-23.0.0\bin\kc.bat" -ArgumentList "start-dev","--http-port=9090" -WindowStyle Normal
Write-Host "Waiting for Keycloak to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

# Test if Keycloak is up
$maxAttempts = 10
$attempt = 0
$keycloakUp = $false

while ($attempt -lt $maxAttempts -and -not $keycloakUp) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 5 -ErrorAction Stop
        $keycloakUp = $true
        Write-Host "Keycloak is UP!" -ForegroundColor Green
    } catch {
        $attempt++
        Write-Host "Waiting... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $keycloakUp) {
    Write-Host "ERROR: Keycloak did not start" -ForegroundColor Red
    Write-Host "Check the Keycloak console window for errors" -ForegroundColor Yellow
    exit
}
Write-Host ""

# Step 5: Configure realm
Write-Host "Step 5: Configuring realm and roles..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$keycloakUrl = "http://localhost:9090"
$adminUser = "admin"
$adminPassword = "admin"
$realm = "wordly-realm"
$clientId = "wordly-client"
$clientSecret = "xe0RClKliAFcibJWgJNb76nVBqoXjRup"

# Get admin token
try {
    $tokenBody = @{
        username = $adminUser
        password = $adminPassword
        grant_type = "password"
        client_id = "admin-cli"
    }
    $tokenResponse = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method Post -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $token = $tokenResponse.access_token
    Write-Host "Got admin token" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not get admin token" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Create realm
try {
    $realmData = @{
        realm = $realm
        enabled = $true
        displayName = "Wordly Realm"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$keycloakUrl/admin/realms" -Method Post -Headers $headers -Body $realmData -ErrorAction Stop
    Write-Host "Realm created" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "Realm already exists" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR creating realm: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Create client
try {
    $clientData = @{
        clientId = $clientId
        enabled = $true
        publicClient = $false
        directAccessGrantsEnabled = $true
        serviceAccountsEnabled = $true
        secret = $clientSecret
        redirectUris = @("*")
        webOrigins = @("*")
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/clients" -Method Post -Headers $headers -Body $clientData -ErrorAction Stop
    Write-Host "Client created" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "Client already exists" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR creating client: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Create roles
$roles = @("TEACHER", "STUDENT", "ADMIN")
foreach ($roleName in $roles) {
    try {
        $roleData = @{
            name = $roleName
            description = "$roleName role"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/roles" -Method Post -Headers $headers -Body $roleData -ErrorAction Stop
        Write-Host "Role $roleName created" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "Role $roleName already exists" -ForegroundColor Yellow
        } else {
            Write-Host "ERROR creating role $roleName" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keycloak is ready at: http://localhost:9090" -ForegroundColor Green
Write-Host "Realm: $realm" -ForegroundColor Green
Write-Host "Client ID: $clientId" -ForegroundColor Green
Write-Host "Client Secret: $clientSecret" -ForegroundColor Green
Write-Host ""
Write-Host "You can now create an admin account:" -ForegroundColor Yellow
Write-Host ".\CREATE_ADMIN_ACCOUNT.ps1"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
