# Simple Keycloak Reset Script
# No special characters, just basic commands

Write-Host "=== SIMPLE KEYCLOAK RESET ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will reset Keycloak to H2 database" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Type YES to continue"
if ($confirm -ne "YES") {
    Write-Host "Cancelled" -ForegroundColor Red
    exit
}

# Stop Java
Write-Host ""
Write-Host "Stopping Java processes..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3
Write-Host "Done" -ForegroundColor Green

# Delete data
Write-Host ""
Write-Host "Deleting Keycloak data..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\data") {
    Remove-Item "C:\keycloak-23.0.0\data" -Recurse -Force
    Write-Host "Done" -ForegroundColor Green
} else {
    Write-Host "No data found" -ForegroundColor Yellow
}

# Delete config
Write-Host ""
Write-Host "Deleting old config..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\conf\keycloak.conf") {
    Remove-Item "C:\keycloak-23.0.0\conf\keycloak.conf" -Force
    Write-Host "Done" -ForegroundColor Green
} else {
    Write-Host "No config found" -ForegroundColor Yellow
}

# Create new config
Write-Host ""
Write-Host "Creating H2 config..." -ForegroundColor Yellow
$configText = "hostname-strict=false`r`nhostname-strict-https=false`r`nhttp-enabled=true`r`nhttp-port=9090"
Set-Content -Path "C:\keycloak-23.0.0\conf\keycloak.conf" -Value $configText
Write-Host "Done" -ForegroundColor Green

# Start Keycloak
Write-Host ""
Write-Host "Starting Keycloak..." -ForegroundColor Yellow
Write-Host "A new window will open - wait for 'Keycloak started' message" -ForegroundColor Cyan
Write-Host ""
Start-Process -FilePath "C:\keycloak-23.0.0\bin\kc.bat" -ArgumentList "start-dev --http-port=9090"

Write-Host ""
Write-Host "Waiting 60 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:9090" -ForegroundColor White
Write-Host "2. Create admin user: admin / admin" -ForegroundColor White
Write-Host "3. Run: .\AUTO_CONFIGURE_KEYCLOAK.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
