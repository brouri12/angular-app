# Complete Keycloak reset to H2 database
# This will delete ALL Keycloak data and start fresh

Write-Host "=== FORCE CLEAN KEYCLOAK TO H2 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will DELETE ALL Keycloak data!" -ForegroundColor Red
Write-Host "This includes all users, realms, clients, and configurations." -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Type 'DELETE' to confirm"
if ($confirm -ne "DELETE") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    exit
}
Write-Host ""

# Step 1: Kill all Java processes (Keycloak)
Write-Host "Step 1: Stopping Keycloak..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "java"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "OK - Keycloak stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Delete ALL Keycloak data
Write-Host "Step 2: Deleting ALL Keycloak data..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\data") {
    Remove-Item -Path "C:\keycloak-23.0.0\data" -Recurse -Force
    Write-Host "OK - Data folder deleted" -ForegroundColor Green
}
else {
    Write-Host "OK - No data folder found" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Remove MySQL configuration
Write-Host "Step 3: Removing MySQL configuration..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\conf\keycloak.conf") {
    Remove-Item -Path "C:\keycloak-23.0.0\conf\keycloak.conf" -Force
    Write-Host "OK - Old config removed" -ForegroundColor Green
}
else {
    Write-Host "OK - No config found" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Create clean H2 configuration
Write-Host "Step 4: Creating H2 configuration..." -ForegroundColor Yellow
$config = @"
# Keycloak H2 Database Configuration
# This uses the default H2 embedded database

# Hostname settings
hostname-strict=false
hostname-strict-https=false

# HTTP settings
http-enabled=true
http-port=9090

# Database (H2 - default, no configuration needed)
# Keycloak will automatically use H2 if no database is configured
"@
$config | Out-File -FilePath "C:\keycloak-23.0.0\conf\keycloak.conf" -Encoding UTF8 -Force
Write-Host "OK - H2 configuration created" -ForegroundColor Green
Write-Host ""

# Step 5: Start Keycloak
Write-Host "Step 5: Starting Keycloak with H2..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Keycloak will take 1-2 minutes to start!" -ForegroundColor Cyan
Write-Host "A new window will open. Wait for the message:" -ForegroundColor Cyan
Write-Host "'Keycloak 23.0.0 started in XXXms'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting Keycloak..." -ForegroundColor Yellow

Start-Process -FilePath "C:\keycloak-23.0.0\bin\kc.bat" -ArgumentList "start-dev","--http-port=9090" -WindowStyle Normal

Write-Host ""
Write-Host "Waiting 60 seconds for Keycloak to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Test if Keycloak is up
Write-Host "Testing Keycloak connection..." -ForegroundColor Yellow
$maxAttempts = 12
$attempt = 0
$keycloakUp = $false

while ($attempt -lt $maxAttempts -and -not $keycloakUp) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 5 -ErrorAction Stop
        $keycloakUp = $true
        Write-Host "OK - Keycloak is UP and running!" -ForegroundColor Green
    }
    catch {
        $attempt++
        Write-Host "  Waiting... (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $keycloakUp) {
    Write-Host ""
    Write-Host "ERROR - Keycloak did not respond" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the Keycloak console window for errors." -ForegroundColor Yellow
    Write-Host "If you see 'Keycloak started', continue to next step." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to continue anyway..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open http://localhost:9090 in your browser" -ForegroundColor Yellow
Write-Host "2. Create initial admin user:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin" -ForegroundColor White
Write-Host ""
Write-Host "3. After creating admin, run:" -ForegroundColor Yellow
Write-Host "   .\AUTO_CONFIGURE_KEYCLOAK.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
