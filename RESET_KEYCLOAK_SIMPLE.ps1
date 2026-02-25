# Script to reset and configure Keycloak automatically
# Run this script as administrator

Write-Host "=== Keycloak Reset and Configuration ===" -ForegroundColor Cyan

# Step 1: Stop Keycloak if running
Write-Host "`n[1/3] Checking if Keycloak is running..." -ForegroundColor Yellow
$keycloakProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*keycloak*" }
if ($keycloakProcess) {
    Write-Host "Stopping Keycloak..." -ForegroundColor Yellow
    Stop-Process -Id $keycloakProcess.Id -Force
    Start-Sleep -Seconds 3
    Write-Host "OK Keycloak stopped" -ForegroundColor Green
} else {
    Write-Host "OK Keycloak is not running" -ForegroundColor Green
}

# Step 2: Delete corrupted data folder
Write-Host "`n[2/3] Deleting corrupted data folder..." -ForegroundColor Yellow
$dataPath = "C:\keycloak-23.0.0\data"
if (Test-Path $dataPath) {
    Remove-Item -Recurse -Force $dataPath
    Write-Host "OK Data folder deleted" -ForegroundColor Green
} else {
    Write-Host "OK Data folder does not exist" -ForegroundColor Green
}

# Step 3: Start Keycloak
Write-Host "`n[3/3] Starting Keycloak..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds..." -ForegroundColor Gray

$keycloakPath = "C:\keycloak-23.0.0"
Start-Process cmd -ArgumentList "/c cd $keycloakPath && bin\kc.bat start-dev --http-port=9090" -WindowStyle Minimized

Write-Host "Waiting for Keycloak to start (60 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 60

Write-Host "OK Keycloak should be starting..." -ForegroundColor Green

# Summary
Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "`n1. Wait for Keycloak to fully start (check the console window)" -ForegroundColor White
Write-Host "`n2. Open Keycloak Admin Console:" -ForegroundColor White
Write-Host "   URL: http://localhost:9090/admin" -ForegroundColor Gray
Write-Host "   Login: admin / admin" -ForegroundColor Gray

Write-Host "`n3. Create realm 'wordly-realm':" -ForegroundColor White
Write-Host "   - Click dropdown (top left) -> Create Realm" -ForegroundColor Gray
Write-Host "   - Realm name: wordly-realm" -ForegroundColor Gray
Write-Host "   - Click Create" -ForegroundColor Gray

Write-Host "`n4. Create roles (in wordly-realm):" -ForegroundColor White
Write-Host "   - Left menu: Realm roles -> Create role" -ForegroundColor Gray
Write-Host "   - Create: TEACHER, STUDENT, ADMIN" -ForegroundColor Gray

Write-Host "`n5. Create client 'wordly-client':" -ForegroundColor White
Write-Host "   - Left menu: Clients -> Create client" -ForegroundColor Gray
Write-Host "   - Client ID: wordly-client" -ForegroundColor Gray
Write-Host "   - Client authentication: ON" -ForegroundColor Gray
Write-Host "   - Direct access grants: ON" -ForegroundColor Gray
Write-Host "   - Save, then go to Credentials tab" -ForegroundColor Gray
Write-Host "   - Set secret to: nn9A67Ft98deqnIWKZjpu0u61desPIjW" -ForegroundColor Gray

Write-Host "`n6. Create ADMIN user via PowerShell:" -ForegroundColor White
Write-Host '   $body = @{' -ForegroundColor Gray
Write-Host '       username = "admin"' -ForegroundColor Gray
Write-Host '       email = "admin@test.com"' -ForegroundColor Gray
Write-Host '       password = "Admin123!"' -ForegroundColor Gray
Write-Host '       role = "ADMIN"' -ForegroundColor Gray
Write-Host '       nom = "Admin"' -ForegroundColor Gray
Write-Host '       prenom = "System"' -ForegroundColor Gray
Write-Host '       telephone = "00000000"' -ForegroundColor Gray
Write-Host '   } | ConvertTo-Json' -ForegroundColor Gray
Write-Host '   Invoke-RestMethod -Uri "http://localhost:8888/user-service/api/auth/register" -Method POST -ContentType "application/json" -Body $body' -ForegroundColor Gray

Write-Host "`n7. Assign ADMIN role in Keycloak:" -ForegroundColor White
Write-Host "   - Users -> admin -> Role mapping -> Assign role -> ADMIN" -ForegroundColor Gray

Write-Host "`nPress any key to close..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
