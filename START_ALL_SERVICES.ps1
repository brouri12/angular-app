# Start All Services Script
# Run this in PowerShell to check and start all required services

Write-Host "=== Checking Service Status ===" -ForegroundColor Cyan

# Check MySQL
Write-Host "`nChecking MySQL (Port 3307)..." -ForegroundColor Yellow
$mysql = netstat -ano | findstr ":3307"
if ($mysql) {
    Write-Host "✓ MySQL is running" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL is NOT running" -ForegroundColor Red
    Write-Host "  Start MySQL service manually" -ForegroundColor Yellow
}

# Check Keycloak
Write-Host "`nChecking Keycloak (Port 9090)..." -ForegroundColor Yellow
$keycloak = netstat -ano | findstr ":9090"
if ($keycloak) {
    Write-Host "✓ Keycloak is running" -ForegroundColor Green
} else {
    Write-Host "✗ Keycloak is NOT running" -ForegroundColor Red
    Write-Host "  Start with: cd C:\keycloak-23.0.0\bin; .\kc.bat start-dev" -ForegroundColor Yellow
}

# Check Eureka Server
Write-Host "`nChecking Eureka Server (Port 8761)..." -ForegroundColor Yellow
$eureka = netstat -ano | findstr ":8761"
if ($eureka) {
    Write-Host "✓ Eureka Server is running" -ForegroundColor Green
} else {
    Write-Host "✗ Eureka Server is NOT running" -ForegroundColor Red
    Write-Host "  Start in IntelliJ: EurekaServer/src/main/java/.../EurekaServerApplication.java" -ForegroundColor Yellow
}

# Check API Gateway
Write-Host "`nChecking API Gateway (Port 8888)..." -ForegroundColor Yellow
$gateway = netstat -ano | findstr ":8888"
if ($gateway) {
    Write-Host "✓ API Gateway is running" -ForegroundColor Green
} else {
    Write-Host "✗ API Gateway is NOT running" -ForegroundColor Red
    Write-Host "  Start in IntelliJ: ApiGateway/src/main/java/.../ApiGatewayApplication.java" -ForegroundColor Yellow
}

# Check User Service
Write-Host "`nChecking User Service (Port 8085)..." -ForegroundColor Yellow
$userService = netstat -ano | findstr ":8085"
if ($userService) {
    Write-Host "✓ User Service is running" -ForegroundColor Green
} else {
    Write-Host "✗ User Service is NOT running" -ForegroundColor Red
    Write-Host "  Start in IntelliJ: UserService/src/main/java/.../UserApplication.java" -ForegroundColor Yellow
}

# Check Abonnement Service
Write-Host "`nChecking Abonnement Service (Port 8084)..." -ForegroundColor Yellow
$abonnementService = netstat -ano | findstr ":8084"
if ($abonnementService) {
    Write-Host "✓ Abonnement Service is running" -ForegroundColor Green
} else {
    Write-Host "✗ Abonnement Service is NOT running" -ForegroundColor Red
    Write-Host "  Start in IntelliJ: AbonnementService/src/main/java/.../AbonnementApplication.java" -ForegroundColor Yellow
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "All services must be running for login to work." -ForegroundColor White
Write-Host "`nStartup Order:" -ForegroundColor Yellow
Write-Host "1. MySQL (Port 3307)" -ForegroundColor White
Write-Host "2. Keycloak (Port 9090)" -ForegroundColor White
Write-Host "3. Eureka Server (Port 8761) - Wait 30 seconds" -ForegroundColor White
Write-Host "4. API Gateway (Port 8888)" -ForegroundColor White
Write-Host "5. User Service (Port 8085)" -ForegroundColor White
Write-Host "6. Abonnement Service (Port 8084)" -ForegroundColor White

Write-Host "`nPress any key to test endpoints..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n=== Testing Endpoints ===" -ForegroundColor Cyan

# Test Keycloak
Write-Host "`nTesting Keycloak..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ Keycloak is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Keycloak is NOT accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Eureka
Write-Host "`nTesting Eureka..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8761" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ Eureka is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Eureka is NOT accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API Gateway
Write-Host "`nTesting API Gateway..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ API Gateway is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ API Gateway is NOT accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test User Service through Gateway
Write-Host "`nTesting User Service (through Gateway)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/user-service/api/auth/test-keycloak" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✓ User Service is accessible through Gateway" -ForegroundColor Green
} catch {
    Write-Host "✗ User Service is NOT accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "If any service is not running, start it in IntelliJ IDEA." -ForegroundColor White
