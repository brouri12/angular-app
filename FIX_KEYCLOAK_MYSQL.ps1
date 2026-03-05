# Script to configure Keycloak to use MySQL instead of H2

Write-Host "=== Configuring Keycloak to use MySQL ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Delete corrupted H2 database
Write-Host "Step 1: Removing old H2 database..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\data") {
    Remove-Item -Path "C:\keycloak-23.0.0\data" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "SUCCESS: Old H2 database removed" -ForegroundColor Green
} else {
    Write-Host "INFO: No H2 database found" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Create MySQL configuration
Write-Host "Step 2: Creating MySQL configuration..." -ForegroundColor Yellow
$keycloakConfig = @"
# MySQL Database Configuration
db=mysql
db-url=jdbc:mysql://localhost:3307/keycloak_db
db-username=root
db-password=

# Hostname configuration
hostname-strict=false
hostname-strict-https=false

# HTTP configuration
http-enabled=true
http-port=9090
"@

$keycloakConfig | Out-File -FilePath "C:\keycloak-23.0.0\conf\keycloak.conf" -Encoding UTF8 -Force
Write-Host "SUCCESS: Configuration file created" -ForegroundColor Green
Write-Host ""

# Step 3: Verify MySQL JDBC driver
Write-Host "Step 3: Checking MySQL JDBC driver..." -ForegroundColor Yellow
if (Test-Path "C:\keycloak-23.0.0\providers\mysql-connector-j-*.jar") {
    Write-Host "SUCCESS: MySQL JDBC driver found" -ForegroundColor Green
} else {
    Write-Host "WARNING: MySQL JDBC driver not found!" -ForegroundColor Red
    Write-Host "Download it from: https://dev.mysql.com/downloads/connector/j/" -ForegroundColor Yellow
    Write-Host "Place it in: C:\keycloak-23.0.0\providers\" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "=== Configuration Complete! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure XAMPP MySQL is running on port 3307"
Write-Host "2. Start Keycloak: cd C:\keycloak-23.0.0"
Write-Host "3. Run: bin\kc.bat start-dev --http-port=9090"
Write-Host "4. Wait 2-3 minutes for first startup (creates MySQL tables)"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
