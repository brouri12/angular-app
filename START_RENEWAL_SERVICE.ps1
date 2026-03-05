# ================================================
# Script: Start Renewal Email Service
# ================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RENEWAL EMAIL SERVICE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This service will:" -ForegroundColor Yellow
Write-Host "  - Check for expiring subscriptions daily at 9 AM" -ForegroundColor White
Write-Host "  - Send email reminders 7 days before expiration" -ForegroundColor White
Write-Host "  - Include unique promo codes (15% discount)" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 1: EMAIL CONFIGURATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "You need to configure Gmail:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://myaccount.google.com/security" -ForegroundColor White
Write-Host "  2. Enable 2-Step Verification" -ForegroundColor White
Write-Host "  3. Go to 'App passwords'" -ForegroundColor White
Write-Host "  4. Generate password for 'Mail'" -ForegroundColor White
Write-Host "  5. Copy the 16-character password" -ForegroundColor White
Write-Host ""

$configFile = "AbonnementService/src/main/resources/application.properties"

if (Test-Path $configFile) {
    Write-Host "Found configuration file!" -ForegroundColor Green
    Write-Host ""
    
    $response = Read-Host "Do you want to update email configuration now? (Y/N)"
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host ""
        $email = Read-Host "Enter your Gmail address"
        $password = Read-Host "Enter your App Password (16 characters)" -AsSecureString
        $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        
        # Update configuration
        $content = Get-Content $configFile
        $content = $content -replace "spring.mail.username=.*", "spring.mail.username=$email"
        $content = $content -replace "spring.mail.password=.*", "spring.mail.password=$passwordPlain"
        $content | Set-Content $configFile
        
        Write-Host ""
        Write-Host "Email configuration updated!" -ForegroundColor Green
    }
} else {
    Write-Host "Configuration file not found!" -ForegroundColor Red
    Write-Host "Please update manually: $configFile" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 2: BUILD PROJECT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Build project now? (Y/N)"

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Building project..." -ForegroundColor Cyan
    
    Set-Location AbonnementService
    mvn clean install -DskipTests
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Build successful!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Build failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 3: START SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To start the service, run:" -ForegroundColor Yellow
Write-Host "  cd AbonnementService" -ForegroundColor Cyan
Write-Host "  mvn spring-boot:run" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTING ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Once started, test with:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Health Check:" -ForegroundColor White
Write-Host "   curl http://localhost:8084/api/renewal/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Generate Promo Code:" -ForegroundColor White
Write-Host "   curl http://localhost:8084/api/promo/generate" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Manual Trigger (for testing):" -ForegroundColor White
Write-Host "   curl -X POST http://localhost:8084/api/renewal/trigger" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PROMO CODES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Available promo codes:" -ForegroundColor Yellow
Write-Host "  RENEW-XXXXX  - 15% off (auto-generated)" -ForegroundColor Green
Write-Host "  WELCOME10    - 10% off (welcome discount)" -ForegroundColor Green
Write-Host "  STUDENT20    - 20% off (student discount)" -ForegroundColor Green
Write-Host "  SUMMER50     - 50% off (summer promotion)" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DOCUMENTATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "For complete guide, see:" -ForegroundColor Yellow
Write-Host "  RENEWAL_EMAIL_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  READY TO START!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
