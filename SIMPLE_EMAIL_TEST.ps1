# Simple Email Test - Just send the email
Write-Host "Sending test email..." -ForegroundColor Cyan

$body = @{
    email = "freaksboysstreetboys@gmail.com"
    name = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:8084/api/test/send-email" `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30

    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Promo Code: $($response.promoCode)" -ForegroundColor Yellow
    Write-Host "Check: freaksboysstreetboys@gmail.com" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Is AbonnementService running?" -ForegroundColor Yellow
    Write-Host "Run in another terminal:"
    Write-Host "  cd AbonnementService"
    Write-Host "  mvn spring-boot" -NoNewline
    Write-Host ":run"
}
