# Quick script to start Keycloak

Write-Host "Starting Keycloak..." -ForegroundColor Cyan
Write-Host ""

# Check if already running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090" -Method GET -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Keycloak is already running!" -ForegroundColor Green
    Write-Host "Access it at: http://localhost:9090" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit
} catch {
    Write-Host "Keycloak is not running. Starting now..." -ForegroundColor Yellow
}

# Kill any existing Java processes (Keycloak)
Write-Host "Stopping any existing Keycloak processes..." -ForegroundColor Yellow
taskkill /F /IM java.exe 2>$null | Out-Null

# Clean database locks
Write-Host "Cleaning database locks..." -ForegroundColor Yellow
Remove-Item "C:\keycloak-23.0.0\data\h2\*.lock.db" -ErrorAction SilentlyContinue
Remove-Item "C:\keycloak-23.0.0\data\h2\*.trace.db" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Starting Keycloak on port 9090..." -ForegroundColor Green
Write-Host "This will take about 30 seconds..." -ForegroundColor Yellow
Write-Host ""

# Start Keycloak
cd C:\keycloak-23.0.0
Start-Process -FilePath "cmd.exe" -ArgumentList "/c","bin\kc.bat start-dev --http-port=9090"

Write-Host "Waiting for Keycloak to start..." -ForegroundColor Yellow

# Wait and check if started
$maxAttempts = 30
$attempt = 0
$started = $false

while ($attempt -lt $maxAttempts -and -not $started) {
    Start-Sleep -Seconds 2
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090" -Method GET -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $started = $true
        Write-Host ""
        Write-Host "SUCCESS! Keycloak is running!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Access Keycloak at:" -ForegroundColor Cyan
        Write-Host "  Admin Console: http://localhost:9090/admin" -ForegroundColor White
        Write-Host "  Username: admin" -ForegroundColor White
        Write-Host "  Password: admin" -ForegroundColor White
        Write-Host ""
        Write-Host "Realm: wordly-realm" -ForegroundColor Cyan
        Write-Host "Client: wordly-client" -ForegroundColor Cyan
        Write-Host ""
    } catch {
        Write-Host "." -NoNewline
    }
}

if (-not $started) {
    Write-Host ""
    Write-Host "ERROR: Keycloak failed to start after 60 seconds" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "1. Java is installed (java -version)" -ForegroundColor White
    Write-Host "2. Port 9090 is not in use" -ForegroundColor White
    Write-Host "3. Keycloak directory exists at C:\keycloak-23.0.0" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to exit"
