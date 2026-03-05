# Quick system status check

Write-Host "=== SYSTEM STATUS CHECK ===" -ForegroundColor Cyan
Write-Host ""

# Check if Keycloak is running
Write-Host "Checking Keycloak (9090)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ Keycloak is UP" -ForegroundColor Green
} catch {
    Write-Host "✗ Keycloak is DOWN or not responding" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Check if UserService is running
Write-Host "Checking UserService (8085)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/actuator/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ UserService is UP" -ForegroundColor Green
} catch {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8085" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✓ UserService is UP (no actuator)" -ForegroundColor Green
    } catch {
        Write-Host "✗ UserService is DOWN or not responding" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}
Write-Host ""

# Check if API Gateway is running
Write-Host "Checking API Gateway (8888)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ API Gateway is UP" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✓ API Gateway is UP (404 is normal)" -ForegroundColor Green
    } else {
        Write-Host "✗ API Gateway is DOWN or not responding" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}
Write-Host ""

# Check if Eureka is running
Write-Host "Checking Eureka (8761)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8761" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✓ Eureka is UP" -ForegroundColor Green
} catch {
    Write-Host "✗ Eureka is DOWN or not responding" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test Keycloak connection from UserService perspective
Write-Host "Testing Keycloak connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8085/api/auth/test-keycloak" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ UserService can connect to Keycloak" -ForegroundColor Green
    Write-Host "  Realms found: $($response.realms_count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ UserService cannot connect to Keycloak" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.ErrorDetails.Message) {
        $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorObj.error)" -ForegroundColor Gray
    }
}
Write-Host ""

# Check Java processes
Write-Host "Checking Java processes..." -ForegroundColor Yellow
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "✓ Found $($javaProcesses.Count) Java process(es)" -ForegroundColor Green
    foreach ($proc in $javaProcesses) {
        Write-Host "  PID: $($proc.Id) - Memory: $([math]::Round($proc.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ No Java processes found" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If any service is DOWN:" -ForegroundColor Yellow
Write-Host "1. Check IntelliJ console for errors" -ForegroundColor Gray
Write-Host "2. Check Keycloak console window" -ForegroundColor Gray
Write-Host "3. Try restarting the service" -ForegroundColor Gray
Write-Host ""
Write-Host "If Keycloak connection fails:" -ForegroundColor Yellow
Write-Host "1. Run: .\FORCE_CLEAN_KEYCLOAK_H2.ps1" -ForegroundColor Gray
Write-Host "2. Recreate admin in Keycloak (admin/admin)" -ForegroundColor Gray
Write-Host "3. Run: .\AUTO_CONFIGURE_KEYCLOAK.ps1" -ForegroundColor Gray
Write-Host ""
