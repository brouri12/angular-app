# Script de test des endpoints des microservices
# test-endpoints.ps1

Write-Host "🚀 TEST DES MICROSERVICES" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Test Formation Service (port 8081)
Write-Host "`n📚 Formation Service (Port 8081)" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/courses/test" -Method GET
    Write-Host "✅ Formation Service OK" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "❌ Formation Service ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Quiz Badge Service (port 8082)
Write-Host "`n🏆 Quiz Badge Service (Port 8082)" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8082/api/questions/test" -Method GET
    Write-Host "✅ Quiz Badge Service OK" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor White
} catch {
    Write-Host "❌ Quiz Badge Service ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Health endpoints
Write-Host "`n🏥 Health Checks" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan

# Formation Service Health
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/courses/health" -Method GET
    Write-Host "✅ Formation Health: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Formation Health ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Quiz Badge Service Health
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8082/actuator/health" -Method GET
    Write-Host "✅ Quiz Badge Health: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Quiz Badge Health ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 TESTS TERMINES" -ForegroundColor Yellow
