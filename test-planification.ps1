Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing PlanificationService" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if service is running
Write-Host "[1/4] Checking if PlanificationService is running..." -ForegroundColor Yellow
$port8086 = netstat -an | Select-String ":8086"
if ($port8086) {
    Write-Host "✓ Port 8086 is in use (service might be running)" -ForegroundColor Green
} else {
    Write-Host "✗ Port 8086 is NOT in use (service is NOT running)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start PlanificationService first!" -ForegroundColor Red
    Write-Host "Open IntelliJ and run PlanificationApplication.java" -ForegroundColor Yellow
    pause
    exit
}
Write-Host ""

# Test Salles endpoint
Write-Host "[2/4] Testing Salles API (http://localhost:8086/api/salles)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8086/api/salles" -Method GET -ErrorAction Stop
    Write-Host "✓ Salles API is working!" -ForegroundColor Green
    Write-Host "   Found $($response.Count) rooms" -ForegroundColor Gray
} catch {
    Write-Host "✗ Salles API failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Groups endpoint
Write-Host "[3/4] Testing Groups API (http://localhost:8086/api/groups)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8086/api/groups" -Method GET -ErrorAction Stop
    Write-Host "✓ Groups API is working!" -ForegroundColor Green
    Write-Host "   Found $($response.Count) groups" -ForegroundColor Gray
} catch {
    Write-Host "✗ Groups API failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test Planifications endpoint
Write-Host "[4/4] Testing Planifications API (http://localhost:8086/api/planifications)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8086/api/planifications" -Method GET -ErrorAction Stop
    Write-Host "✓ Planifications API is working!" -ForegroundColor Green
    Write-Host "   Found $($response.Count) schedules" -ForegroundColor Gray
} catch {
    Write-Host "✗ Planifications API failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed, the service is working correctly!" -ForegroundColor Green
Write-Host "If tests failed, check the TROUBLESHOOTING.md file" -ForegroundColor Yellow
Write-Host ""

pause
