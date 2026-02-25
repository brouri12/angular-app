# Script to check and create keycloak_db in MySQL

Write-Host "=== Checking MySQL for Keycloak ===" -ForegroundColor Cyan
Write-Host ""

# MySQL connection details
$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
$port = "3307"

# Check if MySQL is accessible
Write-Host "Testing MySQL connection on port $port..." -ForegroundColor Yellow
try {
    $result = & $mysqlPath -u root -P $port -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: MySQL is running and accessible" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Cannot connect to MySQL" -ForegroundColor Red
        Write-Host "Make sure XAMPP MySQL is running on port 3307" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
        exit
    }
} catch {
    Write-Host "ERROR: MySQL not found or not accessible" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    exit
}
Write-Host ""

# Check if keycloak_db exists
Write-Host "Checking if keycloak_db exists..." -ForegroundColor Yellow
$dbCheck = & $mysqlPath -u root -P $port -e "SHOW DATABASES LIKE 'keycloak_db';" 2>&1
if ($dbCheck -match "keycloak_db") {
    Write-Host "SUCCESS: keycloak_db already exists" -ForegroundColor Green
} else {
    Write-Host "INFO: keycloak_db does not exist, creating it..." -ForegroundColor Yellow
    & $mysqlPath -u root -P $port -e "CREATE DATABASE keycloak_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: keycloak_db created" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to create keycloak_db" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "=== MySQL Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now start Keycloak:" -ForegroundColor Yellow
Write-Host "cd C:\keycloak-23.0.0"
Write-Host "bin\kc.bat start-dev --http-port=9090"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
