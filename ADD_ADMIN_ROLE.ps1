# Script to add ADMIN role to Keycloak

$keycloakUrl = "http://localhost:9090"
$realm = "wordly-realm"
$adminUser = "admin"
$adminPassword = "admin"

Write-Host "=== Adding ADMIN Role to Keycloak ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get admin token
Write-Host "Step 1: Getting admin token..." -ForegroundColor Yellow
$tokenBody = @{
    username = $adminUser
    password = $adminPassword
    grant_type = "password"
    client_id = "admin-cli"
}

try {
    $tokenResponse = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method Post -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    $token = $tokenResponse.access_token
    Write-Host "SUCCESS: Got admin token" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ERROR: Could not get admin token" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Make sure Keycloak is running on port 9090" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit
}

# Step 2: Create ADMIN role
Write-Host "Step 2: Creating ADMIN role..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$roleData = @{
    name = "ADMIN"
    description = "Administrator role"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/roles" -Method Post -Headers $headers -Body $roleData
    Write-Host "SUCCESS: ADMIN role created!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "INFO: ADMIN role already exists" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: Could not create ADMIN role" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
}

Write-Host ""
Write-Host "=== Done! ===" -ForegroundColor Cyan
Write-Host "You can now create admin users" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
