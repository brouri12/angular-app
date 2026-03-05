# Restart Services to Apply CORS Fix
Write-Host "=== Restarting Services to Apply CORS Fix ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "IMPORTANT: You need to restart the following services:" -ForegroundColor Yellow
Write-Host "1. API Gateway (port 8888)" -ForegroundColor White
Write-Host "2. AbonnementService (port 8084)" -ForegroundColor White
Write-Host ""
Write-Host "Steps to restart:" -ForegroundColor Yellow
Write-Host "1. Stop the running services (Ctrl+C in their terminals)" -ForegroundColor White
Write-Host "2. Restart API Gateway:" -ForegroundColor White
Write-Host "   cd ApiGateway" -ForegroundColor Gray
Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart AbonnementService:" -ForegroundColor White
Write-Host "   cd AbonnementService" -ForegroundColor Gray
Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "After restarting, test with:" -ForegroundColor Yellow
Write-Host "   .\TEST_REMINDER_SYSTEM.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Changes Made ===" -ForegroundColor Cyan
Write-Host "OK Removed CORS from AbonnementService (was causing duplicate headers)" -ForegroundColor Green
Write-Host "OK Fixed API Gateway CORS to use specific origins instead of patterns" -ForegroundColor Green
Write-Host "OK Frontend now uses API Gateway URL" -ForegroundColor Green
