# ================================================
# Script: Test Renewal Email
# ================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST RENEWAL EMAIL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get user email
$email = Read-Host "Enter your Gmail address to receive test email"
$name = Read-Host "Enter your name (or press Enter for 'Test User')"

if ([string]::IsNullOrWhiteSpace($name)) {
    $name = "Test User"
}

Write-Host ""
Write-Host "Sending test email to: $email" -ForegroundColor Yellow
Write-Host "Name: $name" -ForegroundColor Yellow
Write-Host ""

# Prepare request body
$body = @{
    email = $email
    name = $name
    subscription = "Premium"
} | ConvertTo-Json

# Send request
try {
    Write-Host "Sending request to AbonnementService..." -ForegroundColor Cyan
    
    $response = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:8084/api/test/send-email" `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Email sent to: " -NoNewline -ForegroundColor White
    Write-Host $response.email -ForegroundColor Green
    
    Write-Host "Promo Code: " -NoNewline -ForegroundColor White
    Write-Host $response.promoCode -ForegroundColor Green
    
    Write-Host "Discount: " -NoNewline -ForegroundColor White
    Write-Host $response.discount -ForegroundColor Green
    
    Write-Host "Expiration Date: " -NoNewline -ForegroundColor White
    Write-Host $response.expirationDate -ForegroundColor Green
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CHECK YOUR EMAIL!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Look for email with subject:" -ForegroundColor Yellow
    Write-Host "  'Your Premium Subscription Expires Soon - Special Offer Inside!'" -ForegroundColor White
    Write-Host ""
    Write-Host "If not in inbox, check spam folder!" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    
    Write-Host "Error message: " -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor White
    Write-Host ""
    
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  1. AbonnementService is not running" -ForegroundColor White
    Write-Host "  2. Email configuration is incorrect" -ForegroundColor White
    Write-Host "  3. Gmail App Password is wrong" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "  1. Start AbonnementService: cd AbonnementService && mvn spring-boot:run" -ForegroundColor Cyan
    Write-Host "  2. Check application.properties for email config" -ForegroundColor Cyan
    Write-Host "  3. Verify Gmail App Password (16 characters, no spaces)" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
