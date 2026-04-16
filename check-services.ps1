Write-Host "Checking all services..." -ForegroundColor Cyan

Write-Host "`n1. Checking EurekaServer (8761)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8761" -TimeoutSec 2 -UseBasicParsing
    Write-Host "   ✓ EurekaServer is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ EurekaServer is NOT running" -ForegroundColor Red
}

Write-Host "`n2. Checking ApiGateway (8888)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/actuator/health" -TimeoutSec 2 -UseBasicParsing
    Write-Host "   ✓ ApiGateway is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ ApiGateway is NOT running" -ForegroundColor Red
}

Write-Host "`n3. Checking UserService (8081)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/users" -TimeoutSec 2 -UseBasicParsing
    Write-Host "   ✓ UserService is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ UserService is NOT running" -ForegroundColor Red
}

Write-Host "`n4. Checking PlanificationService (8086)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8086/api/salles" -TimeoutSec 2 -UseBasicParsing
    Write-Host "   ✓ PlanificationService is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ PlanificationService is NOT running - THIS IS THE PROBLEM!" -ForegroundColor Red
    Write-Host "   Check IntelliJ console for errors" -ForegroundColor Yellow
}

Write-Host "`n5. Checking through ApiGateway..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/planification-service/api/salles" -TimeoutSec 2 -UseBasicParsing
    Write-Host "   ✓ Can access PlanificationService through gateway" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Cannot access PlanificationService through gateway" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "If PlanificationService is NOT running:" -ForegroundColor Yellow
Write-Host "1. Check IntelliJ console for red error messages" -ForegroundColor White
Write-Host "2. Look for compilation errors or runtime exceptions" -ForegroundColor White
Write-Host "3. Copy the error and show me" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

