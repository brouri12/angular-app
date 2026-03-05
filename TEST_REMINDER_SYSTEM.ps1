# Test Subscription Reminder System
Write-Host "=== Testing Subscription Reminder System ===" -ForegroundColor Cyan

# Test 1: Check if services are running
Write-Host ""
Write-Host "1. Checking services..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "  OK API Gateway is running on 8888" -ForegroundColor Green
} catch {
    Write-Host "  ERROR API Gateway is NOT running on 8888" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8084" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "  OK AbonnementService is running on 8084" -ForegroundColor Green
} catch {
    Write-Host "  ERROR AbonnementService is NOT running on 8084" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "  OK UserService is running on 8085" -ForegroundColor Green
} catch {
    Write-Host "  ERROR UserService is NOT running on 8085" -ForegroundColor Red
}

# Test 2: Test reminder endpoint through API Gateway
Write-Host ""
Write-Host "2. Testing reminder endpoint through API Gateway..." -ForegroundColor Yellow
try {
    $url = "http://localhost:8888/abonnement-service/api/subscription-reminders/all"
    Write-Host "  URL: $url" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $url -Method GET
    Write-Host "  OK Endpoint accessible through API Gateway" -ForegroundColor Green
    Write-Host "  Reminders count: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Trigger manual check
Write-Host ""
Write-Host "3. Triggering manual reminder check..." -ForegroundColor Yellow
try {
    $url = "http://localhost:8888/abonnement-service/api/subscription-reminders/check-now"
    Write-Host "  URL: $url" -ForegroundColor Gray
    $response = Invoke-RestMethod -Uri $url -Method POST
    Write-Host "  OK Manual check triggered successfully" -ForegroundColor Green
    Write-Host "  Reminders found: $($response.Count)" -ForegroundColor Gray
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open frontend: http://localhost:4200" -ForegroundColor White
Write-Host "2. Login with a user account" -ForegroundColor White
Write-Host "3. Check the bell icon in the header for reminders" -ForegroundColor White
Write-Host "4. If no reminders appear, you may need to create test data" -ForegroundColor White
