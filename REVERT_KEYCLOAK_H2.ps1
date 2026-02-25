# Script to revert Keycloak back to H2 database

Write-Host "=== Reverting Keycloak to H2 Database ===" -ForegroundColor Cyan
Write-Host ""

# Remove MySQL configuration
Write-Host "Removing MySQL configuration..." -ForegroundColor Yellow
$keycloakConfig = @"
# Use H2 database (default - no configuration needed for dev mode)
# Database will be stored in: data/h2/keycloakdb

# Hostname configuration
hostname-strict=false
hostname-strict-https=false

# HTTP configuration
http-enabled=true
http-port=9090
"@

$keycloakConfig | Out-File -FilePath "C:\keycloak-23.0.0\conf\keycloak.conf" -Encoding UTF8 -Force
Write-Host "SUCCESS: Configuration reverted to H2" -ForegroundColor Green
Write-Host ""

# Remove old data directory
Write-Host "Removing old data directory..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\data") {
    Remove-Item -Path "C:\keycloak-23.0.0\data" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "SUCCESS: Old data removed" -ForegroundColor Green
} else {
    Write-Host "INFO: No data directory found" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Configuration Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keycloak will now use H2 (embedded database)" -ForegroundColor Green
Write-Host ""
Write-Host "Start Keycloak:" -ForegroundColor Yellow
Write-Host "cd C:\keycloak-23.0.0"
Write-Host "bin\kc.bat start-dev --http-port=9090"
Write-Host ""
Write-Host "Then run:" -ForegroundColor Yellow
Write-Host ".\AUTO_CONFIGURE_KEYCLOAK.ps1  (to setup realm and roles)"
Write-Host ".\ADD_ADMIN_ROLE.ps1           (to add ADMIN role)"
Write-Host ".\CREATE_ADMIN_ACCOUNT.ps1     (to create admin user)"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
