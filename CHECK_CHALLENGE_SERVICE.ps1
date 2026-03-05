# Check Challenge Service Status
Write-Host "=== Challenge Service Status Check ===" -ForegroundColor Cyan

# Check if Challenge Service is running on port 8086
Write-Host "`n1. Checking if Challenge Service is running on port 8086..." -ForegroundColor Yellow
$challengeService = Get-NetTCPConnection -LocalPort 8086 -ErrorAction SilentlyContinue
if ($challengeService) {
    Write-Host "   ✓ Challenge Service is running on port 8086" -ForegroundColor Green
} else {
    Write-Host "   ✗ Challenge Service is NOT running on port 8086" -ForegroundColor Red
    Write-Host "   → You need to start ChallengeApplication.java in IntelliJ" -ForegroundColor Yellow
}

# Check if API Gateway is running on port 8888
Write-Host "`n2. Checking if API Gateway is running on port 8888..." -ForegroundColor Yellow
$gateway = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if ($gateway) {
    Write-Host "   ✓ API Gateway is running on port 8888" -ForegroundColor Green
} else {
    Write-Host "   ✗ API Gateway is NOT running on port 8888" -ForegroundColor Red
    Write-Host "   → You need to start ApiGatewayApplication.java in IntelliJ" -ForegroundColor Yellow
}

# Check if Eureka is running on port 8761
Write-Host "`n3. Checking if Eureka is running on port 8761..." -ForegroundColor Yellow
$eureka = Get-NetTCPConnection -LocalPort 8761 -ErrorAction SilentlyContinue
if ($eureka) {
    Write-Host "   ✓ Eureka Server is running on port 8761" -ForegroundColor Green
} else {
    Write-Host "   ✗ Eureka Server is NOT running on port 8761" -ForegroundColor Red
    Write-Host "   → You need to start EurekaServerApplication.java in IntelliJ" -ForegroundColor Yellow
}

# Test Challenge Service directly
Write-Host "`n4. Testing Challenge Service directly..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8086/api/challenges" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Challenge Service responds directly on port 8086" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Challenge Service does NOT respond on port 8086" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API Gateway routing
Write-Host "`n5. Testing API Gateway routing to Challenge Service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/challenge-service/api/challenges" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ API Gateway successfully routes to Challenge Service" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ API Gateway does NOT route to Challenge Service" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   → Check if Challenge Service is registered in Eureka" -ForegroundColor Yellow
}

# Check Eureka registration
Write-Host "`n6. Checking Eureka registration..." -ForegroundColor Yellow
Write-Host "   Open http://localhost:8761 in your browser" -ForegroundColor Cyan
Write-Host "   You should see CHALLENGE-SERVICE listed" -ForegroundColor Cyan

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "If Challenge Service is NOT running:" -ForegroundColor Yellow
Write-Host "  1. Open IntelliJ" -ForegroundColor White
Write-Host "  2. Navigate to: ChallengeService/src/main/java/tn/esprit/challenge/ChallengeApplication.java" -ForegroundColor White
Write-Host "  3. Right-click → Run 'ChallengeApplication'" -ForegroundColor White
Write-Host "  4. Wait for 'Started ChallengeApplication' message" -ForegroundColor White
Write-Host "  5. Check Eureka at http://localhost:8761" -ForegroundColor White
Write-Host "  6. Restart API Gateway if needed" -ForegroundColor White

Write-Host "`nIf Challenge Service IS running but not registered:" -ForegroundColor Yellow
Write-Host "  1. Check ChallengeService/src/main/resources/application.properties" -ForegroundColor White
Write-Host "  2. Verify eureka.client.service-url.defaultZone=http://localhost:8761/eureka/" -ForegroundColor White
Write-Host "  3. Restart Challenge Service" -ForegroundColor White
Write-Host "  4. Wait 30 seconds for registration" -ForegroundColor White
Write-Host "  5. Restart API Gateway" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
