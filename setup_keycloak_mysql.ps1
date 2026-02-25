# Keycloak MySQL Setup Script

Write-Host "=== Keycloak MySQL Configuration ===" -ForegroundColor Cyan

# Step 1: Create MySQL database
Write-Host "`n[1/5] Creating MySQL database..." -ForegroundColor Yellow
Write-Host "Please open phpMyAdmin (http://localhost/phpmyadmin) and run this SQL:" -ForegroundColor Green
Write-Host "CREATE DATABASE IF NOT EXISTS keycloak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor White
Write-Host "`nPress Enter after you've created the database..." -ForegroundColor Yellow
Read-Host

# Step 2: Download MySQL Connector
Write-Host "`n[2/5] MySQL Connector Setup" -ForegroundColor Yellow
Write-Host "Download MySQL Connector/J from:" -ForegroundColor Green
Write-Host "https://dev.mysql.com/downloads/connector/j/" -ForegroundColor White
Write-Host "`nOr use direct link:" -ForegroundColor Green
Write-Host "https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-8.0.33.zip" -ForegroundColor White
Write-Host "`nAfter downloading:" -ForegroundColor Yellow
Write-Host "1. Extract the ZIP file" -ForegroundColor White
Write-Host "2. Copy mysql-connector-j-8.0.33.jar to C:\keycloak-23.0.0\providers\" -ForegroundColor White
Write-Host "`nPress Enter after you've copied the JAR file..." -ForegroundColor Yellow
Read-Host

# Step 3: Copy configuration file
Write-Host "`n[3/5] Copying configuration file..." -ForegroundColor Yellow
$sourceConf = "keycloak.conf"
$destConf = "C:\keycloak-23.0.0\conf\keycloak.conf"

if (Test-Path $sourceConf) {
    Copy-Item $sourceConf $destConf -Force
    Write-Host "Configuration file copied successfully!" -ForegroundColor Green
} else {
    Write-Host "Error: keycloak.conf not found in current directory" -ForegroundColor Red
    exit 1
}

# Step 4: Build Keycloak
Write-Host "`n[4/5] Building Keycloak configuration..." -ForegroundColor Yellow
Set-Location "C:\keycloak-23.0.0"
& "bin\kc.bat" build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Keycloak built successfully!" -ForegroundColor Green
} else {
    Write-Host "Error building Keycloak. Check the output above." -ForegroundColor Red
    exit 1
}

# Step 5: Start Keycloak
Write-Host "`n[5/5] Starting Keycloak..." -ForegroundColor Yellow
Write-Host "Setting admin credentials..." -ForegroundColor Green
$env:KEYCLOAK_ADMIN = "admin"
$env:KEYCLOAK_ADMIN_PASSWORD = "admin"

Write-Host "Starting Keycloak on port 9090..." -ForegroundColor Green
Write-Host "Access at: http://localhost:9090" -ForegroundColor Cyan
Write-Host "Login: admin / admin" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop Keycloak" -ForegroundColor Yellow
Write-Host ""

& "bin\kc.bat" start-dev --http-port=9090
