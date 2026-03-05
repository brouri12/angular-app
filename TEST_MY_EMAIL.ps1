# ================================================
# Quick Test: Send Email to Yourself
# ================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTING EMAIL SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configured sender: marwenazouzi44@gmail.com" -ForegroundColor Green
Write-Host ""

# Test 1: Send to yourself
Write-Host "Test 1: Sending renewal email to yourself..." -ForegroundColor Yellow
Write-Host ""

$body1 = @{
    email = "marwenazouzi44@gmail.com"
    name = "Marwen Azouzi"
    subscription = "Premium"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Method POST `
        -Uri "http://localhost:8084/api/test/send-email" `
        -ContentType "application/json" `
        -Body $body1
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Email sent to: $($response1.email)" -ForegroundColor White
    Write-Host "Promo Code: $($response1.promoCode)" -ForegroundColor Cyan
    Write-Host "Discount: $($response1.discount)" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure AbonnementService is running:" -ForegroundColor Yellow
    Write-Host "  cd AbonnementService" -ForegroundColor Cyan
    Write-Host "  mvn spring-boot:run" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Test 2: Send to another email (optional)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
$response = Read-Host "Do you want to send to another email? (Y/N)"

if ($response -eq "Y" -or $response -eq "y") {
    $otherEmail = Read-Host "Enter email address"
    $otherName = Read-Host "Enter name"
    
    Write-Host ""
    Write-Host "Sending to $otherEmail..." -ForegroundColor Yellow
    
    $body2 = @{
        email = $otherEmail
        name = $otherName
        subscription = "Premium"
    } | ConvertTo-Json
    
    try {
        $response2 = Invoke-RestMethod -Method POST `
            -Uri "http://localhost:8084/api/test/send-email" `
            -ContentType "application/json" `
            -Body $body2
        
        Write-Host ""
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "Email sent to: $($response2.email)" -ForegroundColor White
        Write-Host "Promo Code: $($response2.promoCode)" -ForegroundColor Cyan
        Write-Host ""
        
    } catch {
        Write-Host ""
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "  CHECK YOUR EMAIL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Look for:" -ForegroundColor Yellow
Write-Host "  Subject: 'Your Premium Subscription Expires Soon...'" -ForegroundColor White
Write-Host "  From: marwenazouzi44@gmail.com" -ForegroundColor White
Write-Host ""
Write-Host "If not in inbox, check spam folder!" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
