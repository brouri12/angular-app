# Verification script for all configurations

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Configuration Verification Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Stripe Keys in application.properties
Write-Host "1. Checking Stripe Configuration..." -ForegroundColor Yellow
$appProps = Get-Content "UserService\src\main\resources\application.properties" -Raw
if ($appProps -match "stripe.secret.key=sk_test_51T4T13CmhqMbGh2ri2eV8M6dUtEkhJEDQT9YNcPmvE4x4kHstlLaxOs4UrCSRlm6UQwtWDzTiaGkRngTaPlxqC1700z6SRofIx") {
    Write-Host "   OK Stripe Secret Key: Correct" -ForegroundColor Green
} else {
    Write-Host "   ERROR Stripe Secret Key: INCORRECT" -ForegroundColor Red
    $allGood = $false
}

if ($appProps -match "stripe.publishable.key=pk_test_51T4T13CmhqMbGh2rgELLpfm9qBwyRj8CrJTISITJkWaPLmZk1mYj7zO55JNIEpq38yWPaiMWxIVnkMOLaixK0FGB00RGj3bUrQ") {
    Write-Host "   OK Stripe Publishable Key: Correct" -ForegroundColor Green
} else {
    Write-Host "   ERROR Stripe Publishable Key: INCORRECT" -ForegroundColor Red
    $allGood = $false
}

# Check 2: Keycloak Secret in application.properties
Write-Host ""
Write-Host "2. Checking Keycloak Configuration..." -ForegroundColor Yellow
if ($appProps -match "keycloak.credentials.secret=wBCcaBhZbarCcZovTzSniLtjCrYoidvl") {
    Write-Host "   OK Keycloak Client Secret: Correct" -ForegroundColor Green
} else {
    Write-Host "   ERROR Keycloak Client Secret: INCORRECT" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Stripe Key in Frontend
Write-Host ""
Write-Host "3. Checking Frontend Stripe Configuration..." -ForegroundColor Yellow
$frontendStripe = Get-Content "frontend\angular-app\src\app\services\stripe.service.ts" -Raw
if ($frontendStripe -match "pk_test_51T4T13CmhqMbGh2rgELLpfm9qBwyRj8CrJTISITJkWaPLmZk1mYj7zO55JNIEpq38yWPaiMWxIVnkMOLaixK0FGB00RGj3bUrQ") {
    Write-Host "   OK Frontend Stripe Key: Correct" -ForegroundColor Green
} else {
    Write-Host "   ERROR Frontend Stripe Key: INCORRECT" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Keycloak Secret in Frontend
Write-Host ""
Write-Host "4. Checking Frontend Keycloak Configuration..." -ForegroundColor Yellow
$frontendAuth = Get-Content "frontend\angular-app\src\app\services\auth.service.ts" -Raw
if ($frontendAuth -match "wBCcaBhZbarCcZovTzSniLtjCrYoidvl") {
    Write-Host "   OK Frontend Keycloak Secret: Correct" -ForegroundColor Green
} else {
    Write-Host "   ERROR Frontend Keycloak Secret: INCORRECT" -ForegroundColor Red
    $allGood = $false
}

# Check 5: Keycloak Secret in Back-Office
Write-Host ""
Write-Host "5. Checking Back-Office Keycloak Configuration..." -ForegroundColor Yellow
$backofficeAuth = Get-Content "back-office\src\app\services\auth.service.ts" -Raw
if ($backofficeAuth -match "wBCcaBhZbarCcZovTzSniLtjCrYoidvl") {
    Write-Host "   OK Back-Office Keycloak Secret: Correct" -ForegroundColor Green
} else {
    Write-Host "   ERROR Back-Office Keycloak Secret: INCORRECT" -ForegroundColor Red
    $allGood = $false
}

# Check 6: SecurityConfig for Receipt Endpoint
Write-Host ""
Write-Host "6. Checking SecurityConfig for Receipt Endpoint..." -ForegroundColor Yellow
$securityConfig = Get-Content "UserService\src\main\java\tn\esprit\user\config\SecurityConfig.java" -Raw
if ($securityConfig -match 'requestMatchers\("/api/payments/receipt/') {
    Write-Host "   OK Receipt Endpoint: Public Access Configured" -ForegroundColor Green
} else {
    Write-Host "   ERROR Receipt Endpoint: NOT Configured for Public Access" -ForegroundColor Red
    $allGood = $false
}

# Check 7: Services Running
Write-Host ""
Write-Host "7. Checking Running Services..." -ForegroundColor Yellow

# Check UserService
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085/api/users/hello" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK UserService: Running on port 8085" -ForegroundColor Green
} catch {
    Write-Host "   ERROR UserService: NOT Running on port 8085" -ForegroundColor Red
    Write-Host "     Please start UserService in IntelliJ" -ForegroundColor Yellow
    $allGood = $false
}

# Check API Gateway
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/user-service/api/users/hello" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK API Gateway: Running on port 8888" -ForegroundColor Green
} catch {
    Write-Host "   ERROR API Gateway: NOT Running on port 8888" -ForegroundColor Red
    Write-Host "     Please start API Gateway in IntelliJ" -ForegroundColor Yellow
    $allGood = $false
}

# Check Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4200" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK Frontend: Running on port 4200" -ForegroundColor Green
} catch {
    Write-Host "   ERROR Frontend: NOT Running on port 4200" -ForegroundColor Red
    Write-Host "     Please start Frontend" -ForegroundColor Yellow
    $allGood = $false
}

# Check Back-Office
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4201" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK Back-Office: Running on port 4201" -ForegroundColor Green
} catch {
    Write-Host "   ERROR Back-Office: NOT Running on port 4201" -ForegroundColor Red
    Write-Host "     Please start Back-Office" -ForegroundColor Yellow
    $allGood = $false
}

# Check Keycloak
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK Keycloak: Running on port 9090" -ForegroundColor Green
} catch {
    Write-Host "   ERROR Keycloak: NOT Running on port 9090" -ForegroundColor Red
    Write-Host "     Please start Keycloak" -ForegroundColor Yellow
    $allGood = $false
}

# Final Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your system is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Test Stripe Payment: http://localhost:4200/pricing" -ForegroundColor White
    Write-Host "2. Test Admin Validation: http://localhost:4201/payments" -ForegroundColor White
    Write-Host "3. Test Receipt Viewing: .\TEST_RECEIPT_ENDPOINT.ps1" -ForegroundColor White
} else {
    Write-Host "SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If services are not running, see: RESTART_SERVICES_NOW.md" -ForegroundColor Cyan
}
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
